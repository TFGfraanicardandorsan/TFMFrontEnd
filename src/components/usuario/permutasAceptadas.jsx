import { completarIdsBloques, resultadoAPI } from "../../lib/bloquesPermuta.js";
import { useCallback, useState, useEffect } from "react";
import "../../styles/user-common.css";
import { obtenerPermutasAgrupadasPorUsuario, generarBorradorPermuta, notificarCompaneroPermuta } from "../../services/permuta.js";
import { useNavigate } from "react-router-dom";
import { obtenerSesion } from "../../services/login.js";
import { toast } from "react-toastify";
import { logError } from "../../lib/logger.js";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faEnvelope } from "@fortawesome/free-solid-svg-icons";

export default function PermutasAceptadas() {
  const { t } = useTranslation();
  const [permutas, setPermutas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [notificando, setNotificando] = useState(null);
  const [recordatoriosEnviados, setRecordatoriosEnviados] = useState(() => new Set());
  const navigate = useNavigate();

  const abrirPermuta = (IdsPermuta) => {
    IdsPermuta = completarIdsBloques(IdsPermuta, permutas.flatMap(g => g.permutas ?? []));
    sessionStorage.setItem("permutasSeleccionadas", JSON.stringify(IdsPermuta));
    navigate("/generarPermuta", { state: { IdsPermuta } });
  };

  const obtenerPermutasAgrupadas = useCallback(async () => {
    try {
      const response = await obtenerPermutasAgrupadasPorUsuario();
      if (
        response &&
        response.result &&
        Array.isArray(response.result.result)
      ) {
        setPermutas(response.result.result);
      } else {
        setError(t("accepted_swaps.error_loading"));
        logError(response);
      }
      setCargando(false);
    } catch (error) {
      setError(t("accepted_swaps.error_loading"));
      setCargando(false);
      logError(error);
    }
  }, [t]);

  const obtenerDatosUsuario = useCallback(async () => {
    try {
      const response = await obtenerSesion();
      if (response) {
        setUsuario(response.user.uvus);
      } else {
        setError(t("accepted_swaps.error_loading"));
      }
    } catch (error) {
      setError(t("accepted_swaps.error_loading"), error);
    }
  }, [t]);

  useEffect(() => {
    void obtenerPermutasAgrupadas();
    void obtenerDatosUsuario();
  }, [obtenerDatosUsuario, obtenerPermutasAgrupadas]);


  const handleGenerarPermuta = async (IdsPermuta) => {
    try {
      IdsPermuta = completarIdsBloques(IdsPermuta, permutas.flatMap(g => g.permutas ?? []));
      resultadoAPI(await generarBorradorPermuta(IdsPermuta));
      toast.success(t("accepted_swaps.success_generated"));
      abrirPermuta(IdsPermuta);
    } catch (error) {
      toast.error(t("accepted_swaps.error_generated"));
      setError(t("accepted_swaps.error_generated"));
      logError(error);
    }
  };

  const handleNotificarCompanero = async (documentoId) => {
    if (!documentoId || notificando !== null || recordatoriosEnviados.has(documentoId)) return;
    setNotificando(documentoId);
    try {
      const resultado = resultadoAPI(await notificarCompaneroPermuta(documentoId));
      setRecordatoriosEnviados((anteriores) => new Set(anteriores).add(documentoId));
      toast.success(resultado.telegramEnviado
        ? t("accepted_swaps.reminder_success")
        : t("accepted_swaps.reminder_system_only"));
    } catch (error) {
      toast.error(error.message || t("accepted_swaps.reminder_error"));
      logError(error);
    } finally {
      setNotificando(null);
    }
  };

  if (cargando) {
    return <div className="user-loading">{t("accepted_swaps.loading")}</div>;
  }

  if (error) {
    return <div className="user-error">{error}</div>;
  }

  return (
    <div className="page-container">
      <div className="content-wrap">
        <header className="page-header">
          <h2 className="page-title">{t("accepted_swaps.title")}</h2>
          <p className="page-subtitle">
            {t("accepted_swaps.subtitle")}
          </p>
        </header>

        {permutas.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: '20px' }}>
            {permutas.map((grupoPermuta, index) => {
              const usuarios = (grupoPermuta.usuarios ?? []).map((uvus) =>
                uvus?.trim()
              );
              const participantes = grupoPermuta.participantes?.length === usuarios.length
                ? grupoPermuta.participantes
                : usuarios.map((uvus) => ({ uvus, nombre_completo: uvus, correo: null }));
              const permutasDetalles = grupoPermuta.permutas ?? [];
              const usuarioActual = usuario?.trim();
              const estudianteCumplimentado1 =
                grupoPermuta.estudiante_cumplimentado_1?.trim();
              const primerEstudiante =
                estudianteCumplimentado1 || usuarios[0];
              const todasNull = permutasDetalles.every((permuta) => permuta.estado_permuta_asociada === null);
              const todasBorrador = permutasDetalles.every((permuta) => permuta.estado_permuta_asociada === "BORRADOR");
              const puedeGenerarPermuta =
                todasNull && usuarios.includes(usuarioActual);
              const puedeContinuarPermuta = usuarioActual === primerEstudiante && todasBorrador;
              const borradorSinEstudianteAsignado =
                todasBorrador && !estudianteCumplimentado1;
              const todasFirmadas = permutasDetalles.length > 0 && permutasDetalles.every((permuta) => permuta.estado_permuta_asociada === "FIRMADA");
              const puedeCompletarPermuta =
                (todasFirmadas || borradorSinEstudianteAsignado) &&
                usuarios.includes(usuarioActual) &&
                usuarioActual !== primerEstudiante;
              const todasFinalizadas = permutasDetalles.every((permuta) => (permuta.estado_permuta_asociada === "ACEPTADA" || permuta.estado_permuta_asociada === "VALIDADA"));
              const IdsPermuta = permutasDetalles.map((permuta) => permuta.permuta_id);
              const documentoId = grupoPermuta.documento_permuta_id;
              const recordatorioEnviado = recordatoriosEnviados.has(documentoId);
              const puedeNotificar = grupoPermuta.puede_notificar_companero === true && documentoId;

              // Saltar si los datos son incompletos
              if (usuarios.length < 2 || permutasDetalles.length === 0) {
                return null;
              }

              return (
                <div key={index} className="user-card">
                  <div className="permuta-info" style={{ marginBottom: '15px' }}>
                    {participantes.map((participante, participanteIndex) => (
                      <div className="accepted-swap-participant" key={participante.uvus}>
                        <p>
                          <strong>{t(`accepted_swaps.student_${participanteIndex + 1}`)}:</strong>{' '}
                          {participante.nombre_completo || participante.uvus}{' '}
                          <span className="accepted-swap-uvus">({participante.uvus})</span>
                        </p>
                        {participante.correo && (
                          <a className="accepted-swap-email" href={`mailto:${participante.correo}`}>
                            <FontAwesomeIcon icon={faEnvelope} /> {participante.correo}
                          </a>
                        )}
                      </div>
                    ))}

                    {permutasDetalles.map((permuta) => (
                      <div key={permuta.permuta_id} className="permuta-detalle" style={{ marginTop: '10px', padding: '10px', backgroundColor: 'var(--user-accent)', borderRadius: 'var(--border-radius-sm)' }}>
                        <p style={{ margin: '4px 0', fontSize: '0.95em' }}>
                          {permuta.bloque_id && <span>Curso en bloque · misma persona · {permuta.curso}<br /></span>}
                          <strong>{t("accepted_swaps.subject")}:</strong> {permuta.nombre_asignatura}
                        </p>
                        <p style={{ margin: '4px 0', fontSize: '0.95em' }}>
                          <strong>{t("accepted_swaps.code")}:</strong> {permuta.codigo_asignatura}
                        </p>
                        <p style={{ margin: '4px 0', fontSize: '0.95em' }}>
                          <strong>{t("accepted_swaps.group")} {permuta.usuario_1_uvus || usuarios[0]}:</strong> {permuta.grupo_1}
                        </p>
                        <p style={{ margin: '4px 0', fontSize: '0.95em' }}>
                          <strong>{t("accepted_swaps.group")} {permuta.usuario_2_uvus || usuarios[1]}:</strong> {permuta.grupo_2}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                    {puedeGenerarPermuta && (
                      <button className="btn btn-success btn-full" onClick={() => handleGenerarPermuta(IdsPermuta)}>{t("accepted_swaps.generate_swap")}</button>
                    )}
                    {puedeContinuarPermuta && (
                      <button className="btn btn-success btn-full" onClick={() => abrirPermuta(IdsPermuta)}>{t("accepted_swaps.continue_swap")}</button>
                    )}
                    {puedeCompletarPermuta && (
                      <button className="btn btn-primary btn-full" onClick={() => abrirPermuta(IdsPermuta)}>{t("accepted_swaps.complete_swap")}</button>
                    )}
                    {todasFinalizadas && (
                      <button className="btn btn-primary btn-full" onClick={() => abrirPermuta(IdsPermuta)}>{t("accepted_swaps.view_swap")}</button>
                    )}
                    {puedeNotificar && (
                      <button
                        className="btn btn-secondary btn-full"
                        disabled={notificando !== null || recordatorioEnviado}
                        onClick={() => handleNotificarCompanero(documentoId)}
                      >
                        <FontAwesomeIcon icon={faBell} />{' '}
                        {recordatorioEnviado
                          ? t("accepted_swaps.reminder_sent")
                          : notificando === documentoId
                            ? t("accepted_swaps.reminder_sending")
                            : t("accepted_swaps.notify_partner")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="user-error">{t("accepted_swaps.no_swaps")}</div>
        )}
      </div>
    </div>
  );
}
