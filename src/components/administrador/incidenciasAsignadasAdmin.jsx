import { useEffect, useState } from "react";
import "../../styles/admin-common.css";
import { obtenerIncidenciasAsignadasAdmin, solucionarIncidencia } from "../../services/incidencia.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { logError } from "../../lib/logger.js";
import { notificarCierreIncidencia } from "../../services/notificacion.js";
import { useTranslation } from "react-i18next";
import { formatearFecha } from "../../lib/formateadorFechas.js";

export default function IncidenciasAsignadasAdmin() {
  const { t } = useTranslation();
  const [incidencias, setIncidencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [mensajeCierre, setMensajeCierre] = useState("");
  const [incidenciaAResolver, setIncidenciaAResolver] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarIncidencias = async () => {
      try {
        const data = await obtenerIncidenciasAsignadasAdmin();
        setIncidencias(data.result.result);
      } catch (error) {
        logError(error);
      } finally {
        setCargando(false);
      }
    };
    cargarIncidencias();
  }, []);

  const handleAbrirModal = (idIncidencia) => {
    setIncidenciaAResolver(idIncidencia);
    setMensajeCierre("");
    setModalOpen(true);
  };

  const handleCerrarModal = () => {
    setModalOpen(false);
    setMensajeCierre("");
  };

  const handleEnviarMensajeYCerrar = async () => {
    if (!mensajeCierre.trim()) {
      toast.error(t("common.error_empty_message") || "El mensaje no puede estar vacío");
      return;
    }
    try {
      await notificarCierreIncidencia(incidenciaAResolver, mensajeCierre);
      await handleResolverIncidencia(incidenciaAResolver);
      handleCerrarModal();
    } catch (error) {
      toast.error(t("incidents.error_notifying") || "Error al notificar el cierre de la incidencia");
      logError(error);
    }
  };

  const handleResolverIncidencia = async (idIncidencia) => {
    try {
      const response = await solucionarIncidencia(idIncidencia);
      if (!response.err) {
        setIncidencias(incidencias.filter((incidencia) => incidencia.id !== idIncidencia));
        toast.success(t("incidents.resolve_success", { id: idIncidencia }));
      } else {
        logError(response.errmsg);
      }
    } catch (error) {
      toast.error(t("incidents.error_resolving", { id: idIncidencia }) || `Error al resolver la incidencia ${idIncidencia}`);
      logError(error);
    }
  };

  return (
    <>
      <div className="admin-page-container">
        <div className="admin-content-wrap">
          {/* Header */}
          <div className="admin-page-header">
            <h1 className="admin-page-title">🐛 {t("incidents.my_incidents_title")}</h1>
            <p className="admin-page-subtitle">
              {t("incidents.my_incidents_subtitle")}
            </p>
          </div>

          {/* Contenido */}
          {cargando ? (
            <div className="admin-loading">{t("incidents.loading")}</div>
          ) : incidencias.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-state-icon">📭</div>
              <p className="admin-empty-state-text">{t("incidents.no_assigned")}</p>
            </div>
          ) : (
            <div className="admin-grid admin-grid-2">
              {incidencias.map((incidencia) => (
                <div key={incidencia.id} className="admin-card">
                  <div className="admin-card-header">
                    <h2 className="admin-card-title">
                      <span className="admin-card-icon">🎫</span>
                      {t("incidents.detail_title")} #{incidencia.id}
                    </h2>
                    <span className="admin-badge admin-badge-warning">
                      {incidencia.estado_incidencia}
                    </span>
                  </div>
                  <div className="admin-card-body">
                    <p><strong>{t("incidents.creation_date")}:</strong> {formatearFecha(incidencia.fecha_creacion)}</p>
                    <p><strong>{t("incidents.type")}:</strong> {incidencia.tipo_incidencia}</p>
                    <p><strong>{t("incidents.description")}:</strong> {incidencia.descripcion}</p>
                  </div>
                  <div className="admin-card-footer">
                    <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => navigate(`/incidencias/${incidencia.id}`)}>
                      {t("incidents.view_detail")}
                    </button>
                    <button className="admin-btn admin-btn-success admin-btn-sm" onClick={() => handleAbrirModal(incidencia.id)}>
                      ✓ {t("incidents.resolve")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={handleCerrarModal}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">✉️ {t("incidents.closing_message_title")}</h3>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-label">{t("incidents.closing_message_label")}</label>
                <textarea
                  className="admin-textarea"
                  value={mensajeCierre}
                  onChange={(e) => setMensajeCierre(e.target.value)}
                  placeholder={t("incidents.closing_message_placeholder")}
                  rows={6}
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={handleCerrarModal}>
                {t("common.cancel") || "Cancelar"}
              </button>
              <button className="admin-btn admin-btn-primary" onClick={handleEnviarMensajeYCerrar}>
                {t("incidents.send_and_close")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: "80px" }} />
    </>
  );
}
