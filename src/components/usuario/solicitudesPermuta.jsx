import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
    actualizarGruposDeseadosSolicitud,
    cancelarSolicitudPermuta,
    obtenerSolicitudesPermuta,
} from "../../services/permuta.js";
import { obtenerTodosGruposMisAsignaturasSinGrupoUsuario } from "../../services/grupo.js";
import { translateRequestStatus } from "../../lib/i18nLabels.js";
import "../../styles/solicitudesPermuta-style.css";

const extraerLista = (respuesta, mensajeError) => {
    if (respuesta?.err || respuesta?.result?.err) {
        throw new Error(
            respuesta?.errmsg
            || respuesta?.result?.message
            || respuesta?.result?.errmsg
            || mensajeError
        );
    }

    const lista = respuesta?.result?.result;
    if (!Array.isArray(lista)) throw new Error(mensajeError);
    return lista;
};

const obtenerIdSolicitud = (solicitud) => solicitud.solicitud_id ?? solicitud.id;

const normalizarEstado = (estado) => String(estado ?? "").trim().toUpperCase();

const esSolicitudSolicitada = (solicitud) => (
    normalizarEstado(solicitud.estado) === "SOLICITADA"
);

const esSolicitudEditable = (solicitud) => (
    esSolicitudSolicitada(solicitud) && solicitud.editable !== false
);

export default function SolicitudesPermuta() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const tituloModalRef = useRef(null);
    const editorRequestIdRef = useRef(0);

    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState("todas");

    const [modalOpen, setModalOpen] = useState(false);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

    const [editorOpen, setEditorOpen] = useState(false);
    const [gruposDisponibles, setGruposDisponibles] = useState([]);
    const [gruposSeleccionados, setGruposSeleccionados] = useState([]);
    const [cargandoGrupos, setCargandoGrupos] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [errorEdicion, setErrorEdicion] = useState(null);

    const cargarSolicitudes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const respuesta = await obtenerSolicitudesPermuta();
            setSolicitudes(extraerLista(respuesta, t("user.swap_requests.fetch_error")));
        } catch (err) {
            setError(err.message || t("user.swap_requests.load_error"));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        void cargarSolicitudes();
    }, [cargarSolicitudes]);

    useEffect(() => {
        if (!modalOpen && !editorOpen) return undefined;

        tituloModalRef.current?.focus();
        const cerrarConEscape = (event) => {
            if (event.key !== "Escape" || guardando) return;
            editorRequestIdRef.current += 1;
            setModalOpen(false);
            setEditorOpen(false);
            setSolicitudSeleccionada(null);
        };

        document.addEventListener("keydown", cerrarConEscape);
        return () => document.removeEventListener("keydown", cerrarConEscape);
    }, [editorOpen, guardando, modalOpen]);

    const handleCancelar = async (solicitudId) => {
        try {
            const respuesta = await cancelarSolicitudPermuta(solicitudId);
            if (respuesta?.err || respuesta?.result?.err) {
                throw new Error(
                    respuesta?.errmsg
                    || respuesta?.result?.message
                    || t("user.swap_requests.cancel_failed")
                );
            }

            setSolicitudes((prev) => prev.filter(
                (solicitud) => obtenerIdSolicitud(solicitud) !== solicitudId
            ));
            toast.success(t("user.swap_requests.cancel_success"));
            if (obtenerIdSolicitud(solicitudSeleccionada || {}) === solicitudId) {
                setModalOpen(false);
                setSolicitudSeleccionada(null);
            }
        } catch (err) {
            toast.error(err.message || t("user.swap_requests.cancel_error"));
        }
    };

    const abrirModal = (solicitud) => {
        setSolicitudSeleccionada(solicitud);
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setSolicitudSeleccionada(null);
    };

    const abrirEditor = async (solicitud) => {
        if (!esSolicitudEditable(solicitud)) return;

        const requestId = editorRequestIdRef.current + 1;
        editorRequestIdRef.current = requestId;
        setSolicitudSeleccionada(solicitud);
        setEditorOpen(true);
        setCargandoGrupos(true);
        setErrorEdicion(null);
        setGruposDisponibles([]);
        setGruposSeleccionados([]);

        try {
            const respuesta = await obtenerTodosGruposMisAsignaturasSinGrupoUsuario();
            if (requestId !== editorRequestIdRef.current) return;

            const grupos = extraerLista(
                respuesta,
                t("user.swap_requests.groups_load_error", {
                    defaultValue: "No se pudieron cargar los grupos disponibles",
                })
            );
            const codigoAsignatura = String(solicitud.codigo_asignatura);
            const grupoActual = String(solicitud.grupo_solicitante);
            const gruposUnicos = new Map();

            grupos
                .filter((grupo) => (
                    String(grupo.codasignatura) === codigoAsignatura
                    && String(grupo.numgrupo) !== grupoActual
                ))
                .forEach((grupo) => {
                    const id = Number(grupo.id);
                    if (Number.isInteger(id) && id > 0) {
                        gruposUnicos.set(id, { id, numero: grupo.numgrupo });
                    }
                });

            const opciones = [...gruposUnicos.values()].sort((a, b) => (
                String(a.numero).localeCompare(String(b.numero), i18n.resolvedLanguage || "es", {
                    numeric: true,
                })
            ));
            if (opciones.length === 0) {
                throw new Error(t("user.swap_requests.no_groups", {
                    defaultValue: "No hay grupos disponibles para editar esta solicitud",
                }));
            }

            const idsActuales = (
                Array.isArray(solicitud.grupos_deseados_ids)
                    ? solicitud.grupos_deseados_ids
                    : []
            )
                .map((id) => Number(id))
                .filter((id) => Number.isInteger(id) && id > 0);
            const tieneIdsActuales = idsActuales.length > 0;
            const valoresActuales = new Set(
                tieneIdsActuales
                    ? idsActuales
                    : (Array.isArray(solicitud.grupos_deseados) ? solicitud.grupos_deseados : [])
                        .map((grupo) => String(grupo))
            );
            const seleccionInicial = opciones
                .filter((grupo) => (
                    tieneIdsActuales
                        ? valoresActuales.has(grupo.id)
                        : valoresActuales.has(String(grupo.numero))
                ))
                .map((grupo) => grupo.id);

            if (seleccionInicial.length !== valoresActuales.size || seleccionInicial.length === 0) {
                throw new Error(t("user.swap_requests.identify_groups_error", {
                    defaultValue: "No se han podido identificar todos los grupos actuales de la solicitud",
                }));
            }

            setGruposDisponibles(opciones);
            setGruposSeleccionados(seleccionInicial);
        } catch (err) {
            if (requestId === editorRequestIdRef.current) {
                setErrorEdicion(err.message || t("user.swap_requests.edit_prepare_error", {
                    defaultValue: "Error al preparar la edición",
                }));
            }
        } finally {
            if (requestId === editorRequestIdRef.current) {
                setCargandoGrupos(false);
            }
        }
    };

    const cerrarEditor = () => {
        if (guardando) return;
        editorRequestIdRef.current += 1;
        setEditorOpen(false);
        setSolicitudSeleccionada(null);
        setGruposDisponibles([]);
        setGruposSeleccionados([]);
        setErrorEdicion(null);
    };

    const alternarGrupo = (grupoId) => {
        setGruposSeleccionados((seleccionActual) => {
            if (seleccionActual.includes(grupoId)) {
                if (seleccionActual.length === 1) return seleccionActual;
                return seleccionActual.filter((id) => id !== grupoId);
            }
            return [...seleccionActual, grupoId];
        });
    };

    const guardarEdicion = async () => {
        if (!solicitudSeleccionada || gruposSeleccionados.length === 0) {
            setErrorEdicion(t("user.swap_requests.keep_one_group", {
                defaultValue: "La solicitud debe conservar al menos un grupo deseado",
            }));
            return;
        }

        setGuardando(true);
        setErrorEdicion(null);
        try {
            const solicitudId = obtenerIdSolicitud(solicitudSeleccionada);
            const respuesta = await actualizarGruposDeseadosSolicitud(
                solicitudId,
                gruposSeleccionados
            );
            if (respuesta?.err || respuesta?.result?.err) {
                throw new Error(
                    respuesta?.errmsg
                    || respuesta?.result?.message
                    || respuesta?.result?.errmsg
                    || t("user.swap_requests.update_failed", {
                        defaultValue: "No se pudo actualizar la solicitud",
                    })
                );
            }

            const idsSeleccionados = new Set(gruposSeleccionados);
            const nuevosGrupos = gruposDisponibles
                .filter((grupo) => idsSeleccionados.has(grupo.id))
                .map((grupo) => grupo.numero);

            setSolicitudes((prev) => prev.map((solicitud) => (
                obtenerIdSolicitud(solicitud) === solicitudId
                    ? {
                        ...solicitud,
                        grupos_deseados: nuevosGrupos,
                        grupos_deseados_ids: [...gruposSeleccionados],
                    }
                    : solicitud
            )));
            toast.success(t("user.swap_requests.update_success", {
                defaultValue: "Grupos deseados actualizados correctamente",
            }));
            setEditorOpen(false);
            setSolicitudSeleccionada(null);
            setGruposDisponibles([]);
            setGruposSeleccionados([]);
        } catch (err) {
            setErrorEdicion(err.message || t("user.swap_requests.update_error", {
                defaultValue: "Error al actualizar la solicitud",
            }));
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <div className="loading-text">{t("user.swap_requests.loading")}</div>;
    if (error) return <div className="error-text">{t("common.error_prefix", { error })}</div>;

    const solicitudesFiltradas = filtroEstado === "todas"
        ? solicitudes
        : solicitudes.filter((solicitud) => normalizarEstado(solicitud.estado) === filtroEstado);

    const textoBloqueo = t("user.swap_requests.active_swap_lock", {
        defaultValue: "Ya existe una permuta activa. Los grupos no pueden modificarse ni cancelarse.",
    });

    return (
        <div className="page-container">
            <div className="content-wrap">
                <div className="solicitudes-container">
                    <h1 className="solicitudes-title">{t("user.swap_requests.title")}</h1>
                    <p className="solicitudes-description">
                        {t("user.swap_requests.subtitle")}
                    </p>

                    <div className="filtro-container">
                        <label htmlFor="filtroEstado">{t("user.swap_requests.filter_status")}</label>
                        <select
                            id="filtroEstado"
                            value={filtroEstado}
                            onChange={(event) => setFiltroEstado(event.target.value)}
                        >
                            <option value="todas">{t("common.all")}</option>
                            <option value="SOLICITADA">{t("common.request_status.solicitada")}</option>
                            <option value="EMPAREJADA">{t("common.request_status.emparejada")}</option>
                            <option value="ACEPTADA">{t("common.request_status.aceptada")}</option>
                            <option value="RECHAZADA">{t("common.request_status.rechazada")}</option>
                            <option value="CANCELADA">{t("common.request_status.cancelada")}</option>
                        </select>
                    </div>

                    <div className="solicitudes-content">
                        {solicitudesFiltradas.length > 0 ? (
                            <div className="solicitudes-grid">
                                {solicitudesFiltradas.map((solicitud) => {
                                    const solicitudId = obtenerIdSolicitud(solicitud);
                                    const solicitudSolicitada = esSolicitudSolicitada(solicitud);
                                    const solicitudEditable = esSolicitudEditable(solicitud);
                                    const bloqueoId = `solicitud-bloqueada-${solicitudId}`;
                                    return (
                                        <article key={solicitudId} className="user-card solicitud-card">
                                            <div className="solicitud-card-body">
                                                <h3 className="solicitud-asignatura">
                                                    {solicitud.nombre_asignatura}
                                                </h3>
                                                <p className="solicitud-codigo">
                                                    <strong>{t("common.code")}:</strong> {solicitud.codigo_asignatura}
                                                </p>
                                                <p>
                                                    <strong>{t("common.current_group")}:</strong>{" "}
                                                    {solicitud.grupo_solicitante}
                                                </p>
                                                <p>
                                                    <strong>{t("common.desired_groups")}:</strong>{" "}
                                                    {Array.isArray(solicitud.grupos_deseados)
                                                        ? solicitud.grupos_deseados.join(", ")
                                                        : solicitud.grupos_deseados}
                                                </p>
                                                <span className={`solicitud-estado solicitud-estado-${normalizarEstado(solicitud.estado).toLowerCase()}`}>
                                                    {translateRequestStatus(t, solicitud.estado)}
                                                </span>
                                                {solicitudSolicitada && !solicitudEditable && (
                                                    <p id={bloqueoId} className="solicitud-bloqueo" role="note">
                                                        {textoBloqueo}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="solicitud-actions">
                                                <button
                                                    type="button"
                                                    className="btn solicitud-btn-secondary"
                                                    onClick={() => abrirModal(solicitud)}
                                                >
                                                    {t("common.details")}
                                                </button>

                                                {solicitudSolicitada && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        disabled={!solicitudEditable}
                                                        aria-describedby={!solicitudEditable ? bloqueoId : undefined}
                                                        title={!solicitudEditable ? textoBloqueo : undefined}
                                                        onClick={() => void abrirEditor(solicitud)}
                                                    >
                                                        {t("user.swap_requests.edit_groups", {
                                                            defaultValue: "Editar grupos",
                                                        })}
                                                    </button>
                                                )}

                                                {solicitudSolicitada && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        disabled={!solicitudEditable}
                                                        aria-describedby={!solicitudEditable ? bloqueoId : undefined}
                                                        onClick={() => void handleCancelar(solicitudId)}
                                                    >
                                                        {t("common.cancel")}
                                                    </button>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="user-card empty-state solicitudes-empty-state">
                                <div className="solicitudes-empty-icon" aria-hidden="true">📨</div>
                                <h3>{t("user.swap_requests.empty_title")}</h3>
                                <p>{t("user.swap_requests.empty_message")}</p>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => navigate("/solicitarPermuta")}
                                >
                                    {t("user.swap_requests.request_now")}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {modalOpen && solicitudSeleccionada && (
                <div
                    className="modal-overlay"
                    onClick={(event) => event.target === event.currentTarget && cerrarModal()}
                >
                    <div
                        className="modal-content solicitudes-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="detalle-solicitud-titulo"
                    >
                        <h2 id="detalle-solicitud-titulo" ref={tituloModalRef} tabIndex="-1">
                            {t("user.swap_requests.modal_title")}
                        </h2>
                        <p>
                            <strong>{t("common.subject")}:</strong>{" "}
                            {solicitudSeleccionada.nombre_asignatura} ({solicitudSeleccionada.codigo_asignatura})
                        </p>
                        <p>
                            <strong>{t("common.current_group")}:</strong>{" "}
                            {solicitudSeleccionada.grupo_solicitante}
                        </p>
                        <p>
                            <strong>{t("common.desired_groups")}:</strong>{" "}
                            {Array.isArray(solicitudSeleccionada.grupos_deseados)
                                ? solicitudSeleccionada.grupos_deseados.join(", ")
                                : solicitudSeleccionada.grupos_deseados}
                        </p>
                        <p>
                            <strong>{t("common.status")}:</strong>{" "}
                            {translateRequestStatus(t, solicitudSeleccionada.estado)}
                        </p>
                        <p>
                            <strong>{t("common.description_label")}:</strong>{" "}
                            {solicitudSeleccionada.descripcion || "—"}
                        </p>
                        {esSolicitudSolicitada(solicitudSeleccionada)
                            && !esSolicitudEditable(solicitudSeleccionada) && (
                            <p className="solicitud-bloqueo" role="note">{textoBloqueo}</p>
                        )}

                        <div className="modal-actions">
                            {esSolicitudSolicitada(solicitudSeleccionada) && (
                                <button
                                    type="button"
                                    disabled={!esSolicitudEditable(solicitudSeleccionada)}
                                    onClick={() => {
                                        const solicitud = solicitudSeleccionada;
                                        cerrarModal();
                                        void abrirEditor(solicitud);
                                    }}
                                >
                                    {t("user.swap_requests.edit_groups", {
                                        defaultValue: "Editar grupos",
                                    })}
                                </button>
                            )}
                            <button
                                type="button"
                                className="solicitud-modal-cancelar"
                                onClick={cerrarModal}
                            >
                                {t("common.close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editorOpen && solicitudSeleccionada && (
                <div
                    className="modal-overlay"
                    onClick={(event) => event.target === event.currentTarget && cerrarEditor()}
                >
                    <div
                        className="modal-content solicitudes-modal solicitudes-editor"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="editar-solicitud-titulo"
                        aria-describedby="editar-solicitud-ayuda"
                        aria-busy={cargandoGrupos || guardando}
                    >
                        <h2 id="editar-solicitud-titulo" ref={tituloModalRef} tabIndex="-1">
                            {t("user.swap_requests.edit_title", {
                                defaultValue: "Editar grupos deseados",
                            })}
                        </h2>
                        <p className="editor-asignatura">
                            <strong>{solicitudSeleccionada.nombre_asignatura}</strong>{" "}
                            ({solicitudSeleccionada.codigo_asignatura})
                        </p>
                        <p id="editar-solicitud-ayuda" className="editor-ayuda">
                            {t("user.swap_requests.edit_help", {
                                defaultValue: "Marca los grupos que aceptarías. La solicitud debe conservar al menos uno.",
                            })}
                        </p>

                        {cargandoGrupos && (
                            <div className="editor-status" role="status">
                                {t("user.swap_requests.loading_groups", {
                                    defaultValue: "Cargando grupos disponibles...",
                                })}
                            </div>
                        )}

                        {errorEdicion && (
                            <div className="editor-error" role="alert">{errorEdicion}</div>
                        )}

                        {!cargandoGrupos && !errorEdicion && (
                            <fieldset className="grupos-selector" disabled={guardando}>
                                <legend>{t("common.desired_groups")}</legend>
                                <div className="grupos-opciones">
                                    {gruposDisponibles.map((grupo) => {
                                        const seleccionado = gruposSeleccionados.includes(grupo.id);
                                        const esUltimoSeleccionado = seleccionado
                                            && gruposSeleccionados.length === 1;
                                        return (
                                            <label
                                                key={grupo.id}
                                                className={`grupo-opcion ${seleccionado ? "grupo-opcion-seleccionada" : ""}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={seleccionado}
                                                    disabled={guardando || esUltimoSeleccionado}
                                                    onChange={() => alternarGrupo(grupo.id)}
                                                />
                                                <span>{t("common.group_with_number", { group: grupo.numero })}</span>
                                                {esUltimoSeleccionado && (
                                                    <span className="grupo-obligatorio">
                                                        {t("common.required", { defaultValue: "Obligatorio" })}
                                                    </span>
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>
                            </fieldset>
                        )}

                        <div className="modal-actions editor-actions">
                            <button
                                type="button"
                                className="solicitud-modal-cancelar"
                                onClick={cerrarEditor}
                                disabled={guardando}
                            >
                                {t("common.close")}
                            </button>
                            <button
                                type="button"
                                onClick={() => void guardarEdicion()}
                                disabled={
                                    cargandoGrupos
                                    || guardando
                                    || Boolean(errorEdicion)
                                    || gruposSeleccionados.length === 0
                                }
                            >
                                {guardando
                                    ? t("common.saving", { defaultValue: "Guardando..." })
                                    : t("common.save_changes")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="solicitudes-footer-spacer" aria-hidden="true" />
        </div>
    );
}
