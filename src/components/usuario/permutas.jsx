import { useCallback, useEffect, useState } from "react";
import "../../styles/user-common.css";
import "../../styles/permutas-style.css";
import {
  aceptarPermutaPropuestaSistema,
  aceptarPermutaSolicitudesPermuta,
  obtenerPermutasInteresantes,
  obtenerPermutasPropuestasSistema,
  rechazarPermutaPropuestaSistema,
} from "../../services/permuta.js";
import { useNavigate } from "react-router-dom";
import { logError } from "../../lib/logger.js";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExchangeAlt, faCheck, faBookReader, faTimes, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

const extraerResultado = (respuesta) => {
  const resultado = respuesta?.result?.result;
  if (respuesta?.err || !Array.isArray(resultado)) throw new Error(respuesta?.errmsg || "Respuesta no válida");
  return resultado;
};

export default function Permutas() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [propuestas, setPropuestas] = useState([]);
  const [disponibles, setDisponibles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(null);

  const cargarPermutas = useCallback(async () => {
    setError(null);
    try {
      const [respuestaPropuestas, respuestaDisponibles] = await Promise.all([
        obtenerPermutasPropuestasSistema(),
        obtenerPermutasInteresantes(),
      ]);
      setPropuestas(extraerResultado(respuestaPropuestas));
      setDisponibles(extraerResultado(respuestaDisponibles));
    } catch (err) {
      setError(t("available_swaps.error_loading"));
      logError(err);
    } finally {
      setCargando(false);
    }
  }, [t]);

  useEffect(() => { void cargarPermutas(); }, [cargarPermutas]);

  const ejecutarAccionPropuesta = async (permutaId, accion) => {
    setProcesando(permutaId);
    try {
      const respuesta = accion === "aceptar"
        ? await aceptarPermutaPropuestaSistema(permutaId)
        : await rechazarPermutaPropuestaSistema(permutaId);
      if (respuesta?.err || respuesta?.result?.err) throw new Error(respuesta?.errmsg || respuesta?.result?.message);
      toast.success(accion === "aceptar" ? "Propuesta aceptada" : "Propuesta rechazada");
      await cargarPermutas();
    } catch (err) {
      toast.error("No se pudo actualizar la propuesta");
      logError(err);
    } finally {
      setProcesando(null);
    }
  };

  const aceptarSolicitud = async (solicitudId) => {
    setProcesando(`solicitud-${solicitudId}`);
    try {
      const respuesta = await aceptarPermutaSolicitudesPermuta(solicitudId);
      if (respuesta?.err || respuesta?.result?.err) throw new Error(respuesta?.errmsg || respuesta?.result?.message);
      toast.success(t("available_swaps.success_accepted"));
      navigate("/misPermutas");
    } catch (err) {
      toast.error(t("available_swaps.error_accepted"));
      logError(err);
    } finally {
      setProcesando(null);
    }
  };

  if (cargando) return <div className="page-container"><div className="user-loading">{t("available_swaps.loading")}</div></div>;
  if (error) return <div className="page-container"><div className="user-error">{error}</div></div>;

  return (
    <div className="page-container">
      <div className="content-wrap permutas-page">
        <div className="page-header">
          <h1 className="page-title">{t("available_swaps.title")}</h1>
          <p className="page-subtitle">Revisa primero las combinaciones óptimas encontradas para ti y, después, el resto de solicitudes compatibles.</p>
        </div>

        <section className="permuta-section permuta-section-featured" aria-labelledby="propuestas-title">
          <div className="permuta-section-heading">
            <FontAwesomeIcon icon={faWandMagicSparkles} />
            <div><h2 id="propuestas-title">Propuestas óptimas del sistema</h2><p>Combinaciones recíprocas calculadas automáticamente.</p></div>
            <span className="permuta-count">{propuestas.length}</span>
          </div>
          {propuestas.length ? <div className="permuta-grid">{propuestas.map((p) => (
            <article key={p.permuta_id} className="user-card permuta-card permuta-card-featured">
              <div className="permuta-subject"><FontAwesomeIcon icon={faBookReader} /><h3>{p.siglas_asignatura || p.nombre_asignatura}</h3></div>
              <p className="permuta-route"><strong>G.{p.grupo_actual}</strong><FontAwesomeIcon icon={faExchangeAlt} /><strong>G.{p.grupo_destino}</strong></p>
              <p className="permuta-code">Código: {p.codigo_asignatura}</p>
              {p.aceptada_por_mi && <p className="permuta-waiting">Aceptada por ti; esperando al otro estudiante.</p>}
              <div className="permuta-actions">
                <button className="btn btn-success" disabled={procesando === p.permuta_id || p.aceptada_por_mi} onClick={() => ejecutarAccionPropuesta(p.permuta_id, "aceptar")}><FontAwesomeIcon icon={faCheck} /> {p.aceptada_por_mi ? "Aceptada" : "Aceptar"}</button>
                <button className="btn permuta-reject" disabled={procesando === p.permuta_id} onClick={() => ejecutarAccionPropuesta(p.permuta_id, "rechazar")}><FontAwesomeIcon icon={faTimes} /> Rechazar</button>
              </div>
            </article>
          ))}</div> : <div className="permuta-empty"><span>✨</span><h3>No tienes propuestas óptimas pendientes</h3><p>El sistema volverá a analizar las solicitudes periódicamente.</p></div>}
        </section>

        <section className="permuta-section" aria-labelledby="disponibles-title">
          <div className="permuta-section-heading"><FontAwesomeIcon icon={faExchangeAlt} /><div><h2 id="disponibles-title">Otras permutas disponibles</h2><p>Solicitudes compatibles a las que puedes aplicar directamente.</p></div><span className="permuta-count">{disponibles.length}</span></div>
          {disponibles.length ? <div className="permuta-grid">{disponibles.map((p) => (
            <article key={`${p.solicitud_id}-${p.grupo_deseado_id}`} className="user-card permuta-card">
              <div className="permuta-subject"><FontAwesomeIcon icon={faBookReader} /><h3>{p.siglas_asignatura}</h3></div>
              <p className="permuta-route"><strong>G.{p.grupo_solicitante}</strong><FontAwesomeIcon icon={faExchangeAlt} /><strong>G.{p.grupo_deseado}</strong></p>
              <p className="permuta-code">{t("available_swaps.code_label")}: {p.codigo_asignatura}</p>
              <button className="btn btn-success btn-full" disabled={procesando === `solicitud-${p.solicitud_id}`} onClick={() => aceptarSolicitud(p.solicitud_id)}><FontAwesomeIcon icon={faCheck} /> {t("available_swaps.accept_btn")}</button>
            </article>
          ))}</div> : <div className="permuta-empty"><span>📭</span><h3>{t("available_swaps.empty_title")}</h3><p>{t("available_swaps.empty_msg")}</p><button className="btn btn-primary" onClick={() => navigate("/solicitarPermuta")}>{t("available_swaps.request_btn")}</button></div>}
        </section>
      </div>
      <div style={{ height: "80px" }} />
    </div>
  );
}
