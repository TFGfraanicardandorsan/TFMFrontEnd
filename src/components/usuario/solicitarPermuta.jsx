import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChalkboardTeacher,
  faCheckCircle,
  faInfoCircle,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { logError } from "../../lib/logger.js";
import { obtenerTodosGruposMisAsignaturasSinGrupoUsuario } from "../../services/grupo.js";
import { solicitarPermuta } from "../../services/permuta.js";
import "../../styles/user-common.css";
import "../../styles/solicitarPermuta-style.css";

const convertirEnteroPositivo = (valor) => {
  const texto = String(valor ?? "").trim();
  if (!/^\d+$/.test(texto)) return null;

  const numero = Number(texto);
  return Number.isSafeInteger(numero) && numero > 0 ? numero : null;
};

const extraerGrupos = (respuesta) => {
  if (respuesta?.err || respuesta?.result?.err) return null;
  return Array.isArray(respuesta?.result?.result)
    ? respuesta.result.result
    : null;
};

const obtenerMensajeError = (respuesta) => {
  if (!respuesta || typeof respuesta !== "object") return "";
  if (respuesta.err) {
    return respuesta.errmsg || respuesta.message || respuesta.error || "";
  }
  if (respuesta.result?.err) {
    return respuesta.result.errmsg
      || respuesta.result.message
      || respuesta.result.error
      || "";
  }
  return null;
};

export default function SeleccionarGruposSinGrupo() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const envioEnCurso = useRef(false);
  const [asignaturas, setAsignaturas] = useState([]);
  const [seleccionados, setSeleccionados] = useState({});
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarGrupos = async () => {
      try {
        setCargando(true);
        setError(null);
        const respuesta = await obtenerTodosGruposMisAsignaturasSinGrupoUsuario();
        const grupos = extraerGrupos(respuesta);

        if (!grupos) {
          throw new Error(
            respuesta?.errmsg
            || respuesta?.result?.message
            || t("user.swap_request.load_error")
          );
        }

        const agrupadas = grupos.reduce((acc, item) => {
          const codigo = convertirEnteroPositivo(item.codasignatura);
          const grupo = convertirEnteroPositivo(item.numgrupo);
          if (!codigo || !grupo) return acc;

          const key = String(codigo);
          if (!acc[key]) {
            acc[key] = {
              codasignatura: codigo,
              nombreasignatura: item.nombreasignatura,
              grupos: [],
            };
          }
          if (!acc[key].grupos.includes(grupo)) {
            acc[key].grupos.push(grupo);
          }
          return acc;
        }, {});

        const asignaturasAgrupadas = Object.values(agrupadas).map((asignatura) => ({
          ...asignatura,
          grupos: [...asignatura.grupos].sort((a, b) => a - b),
        }));
        setAsignaturas(asignaturasAgrupadas);

        if (asignaturasAgrupadas.length === 0) {
          logError(t("user.swap_request.no_subjects_log"));
        }
      } catch (err) {
        logError(err);
        setError(t("user.swap_request.load_error"));
      } finally {
        setCargando(false);
      }
    };

    void cargarGrupos();
  }, [t]);

  const alternarGrupo = (codasignatura, numgrupo) => {
    const key = String(codasignatura);
    setSeleccionados((prev) => {
      const seleccionActual = Array.isArray(prev[key]) ? prev[key] : [];
      const siguienteSeleccion = seleccionActual.includes(numgrupo)
        ? seleccionActual.filter((grupo) => grupo !== numgrupo)
        : [...seleccionActual, numgrupo].sort((a, b) => a - b);
      const siguienteEstado = { ...prev };

      if (siguienteSeleccion.length > 0) {
        siguienteEstado[key] = siguienteSeleccion;
      } else {
        delete siguienteEstado[key];
      }
      return siguienteEstado;
    });
  };

  const seleccionarTodos = (codasignatura, grupos) => {
    setSeleccionados((prev) => ({
      ...prev,
      [String(codasignatura)]: [...grupos],
    }));
  };

  const limpiarSeleccion = (codasignatura) => {
    const key = String(codasignatura);
    setSeleccionados((prev) => {
      const siguienteEstado = { ...prev };
      delete siguienteEstado[key];
      return siguienteEstado;
    });
  };

  const handleSubmit = async () => {
    if (envioEnCurso.current) return;

    const solicitudes = Object.entries(seleccionados)
      .filter(([, grupos]) => Array.isArray(grupos) && grupos.length > 0);
    if (solicitudes.length === 0) {
      toast.info(t("user.swap_request.select_one_warning"));
      return;
    }

    envioEnCurso.current = true;
    setEnviando(true);
    const solicitudesCreadas = [];
    let mensajeError = null;

    try {
      for (const [codigoKey, grupos] of solicitudes) {
        const codigo = convertirEnteroPositivo(codigoKey);
        const gruposNormalizados = [...new Set(
          grupos.map(convertirEnteroPositivo).filter(Boolean)
        )].sort((a, b) => a - b);

        if (!codigo || gruposNormalizados.length === 0) {
          mensajeError = t("user.swap_request.submit_error");
          break;
        }

        const respuesta = await solicitarPermuta(codigo, gruposNormalizados);
        const errorRespuesta = obtenerMensajeError(respuesta);
        if (errorRespuesta !== null) {
          mensajeError = errorRespuesta || t("user.swap_request.submit_error");
          break;
        }
        solicitudesCreadas.push(codigoKey);
      }

      if (solicitudesCreadas.length > 0) {
        const creadas = new Set(solicitudesCreadas);
        setSeleccionados((prev) => Object.fromEntries(
          Object.entries(prev).filter(([codigo]) => !creadas.has(codigo))
        ));
      }

      if (mensajeError) {
        toast.error(mensajeError);
        return;
      }

      toast.success(t("user.swap_request.success"));
      navigate("/misSolicitudesPermuta");
    } catch (err) {
      logError(err);
      toast.error(t("user.swap_request.submit_error"));
    } finally {
      envioEnCurso.current = false;
      setEnviando(false);
    }
  };

  const totalSeleccionados = Object.values(seleccionados)
    .reduce((total, grupos) => total + (Array.isArray(grupos) ? grupos.length : 0), 0);
  const haySeleccion = totalSeleccionados > 0;

  if (cargando) {
    return (
      <div className="page-container">
        <div className="user-loading">{t("user.swap_request.loading")}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrap">
        <div className="page-header">
          <h1 className="page-title">{t("user.swap_request.title")}</h1>
          <p className="page-subtitle">
            {t("user.swap_request.subtitle_multiple", {
              defaultValue: "Selecciona uno, varios o todos los grupos disponibles para cada asignatura.",
            })}
          </p>
        </div>

        {error && <div className="user-error">{error}</div>}

        {asignaturas.length > 0 ? (
          <>
            <div className="solicitar-permuta-grid">
              {asignaturas.map(({ codasignatura, nombreasignatura, grupos }) => {
                const key = String(codasignatura);
                const seleccionAsignatura = seleccionados[key] || [];
                const todosSeleccionados = seleccionAsignatura.length === grupos.length;

                return (
                  <article key={key} className="user-card solicitar-permuta-card">
                    <div className="solicitar-permuta-asignatura">
                      <FontAwesomeIcon icon={faChalkboardTeacher} />
                      <span>{nombreasignatura}</span>
                    </div>

                    <fieldset className="solicitar-grupos-fieldset" disabled={enviando}>
                      <legend>{t("common.desired_groups")}</legend>
                      <div className="solicitar-grupos-toolbar">
                        <button
                          type="button"
                          onClick={() => seleccionarTodos(codasignatura, grupos)}
                          disabled={todosSeleccionados}
                        >
                          {t("user.swap_request.select_all", {
                            defaultValue: "Seleccionar todos",
                          })}
                        </button>
                        <button
                          type="button"
                          onClick={() => limpiarSeleccion(codasignatura)}
                          disabled={seleccionAsignatura.length === 0}
                        >
                          {t("common.clear")}
                        </button>
                      </div>

                      <div className="solicitar-grupos-opciones">
                        {grupos.map((grupo) => {
                          const seleccionado = seleccionAsignatura.includes(grupo);
                          return (
                            <label
                              key={grupo}
                              className={`solicitar-grupo-opcion ${seleccionado ? "seleccionada" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={seleccionado}
                                onChange={() => alternarGrupo(codasignatura, grupo)}
                              />
                              <span>{t("common.group_with_number", { group: grupo })}</span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>

                    {seleccionAsignatura.length > 0 && (
                      <div className="solicitar-seleccion-resumen" aria-live="polite">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <span>
                          {t("user.swap_request.selection_summary", {
                            groups: seleccionAsignatura.join(", "),
                            defaultValue: "Grupos seleccionados: {{groups}}",
                          })}
                        </span>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            <div className="solicitar-permuta-submit">
              <div className="solicitar-permuta-submit-info">
                <FontAwesomeIcon icon={faInfoCircle} />
                <span className="info-text-responsive">
                  {haySeleccion
                    ? t("user.swap_request.ready")
                    : t("user.swap_request.waiting")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                className="btn btn-primary"
                disabled={!haySeleccion || enviando}
              >
                <FontAwesomeIcon icon={faSave} />{" "}
                {enviando ? t("common.processing") : t("user.swap_request.submit")}
              </button>
            </div>
            <div className="solicitar-permuta-footer-spacer" />
          </>
        ) : (
          <div className="user-card empty-state">
            <div className="solicitar-permuta-empty-icon" aria-hidden="true">📚</div>
            <h3>{t("user.swap_request.empty_title")}</h3>
            <p>{t("user.swap_request.empty_message")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
