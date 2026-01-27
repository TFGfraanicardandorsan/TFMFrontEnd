import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/admin-common.css";
import "../../styles/detalleIncidencia-style.css";
import { obtenerIncidenciaPorId } from "../../services/incidencia.js";
import { formatearFecha } from "../../lib/formateadorFechas.js";
import { servirArchivo } from "../../services/subidaArchivos.js";
import { logError } from "../../lib/logger.js";
import { useTranslation } from "react-i18next";

export default function DetalleIncidencia() {
  const { t } = useTranslation();
  const { id } = useParams();
  const idInt = parseInt(id, 10);
  const [incidencia, setIncidencia] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarIncidencia = async () => {
      try {
        const data = await obtenerIncidenciaPorId(idInt);
        if (data && data.result && data.result.result) {
          setIncidencia(data.result.result);
          const nombreArchivo = data.result.result.archivo;
          if (nombreArchivo) {
            const bytes = await servirArchivo("archivador", nombreArchivo);

            let tipo = "application/pdf";
            if (nombreArchivo.toLowerCase().endsWith(".png")) {
              tipo = "image/png";
            } else if (nombreArchivo.toLowerCase().endsWith(".jpg") || nombreArchivo.toLowerCase().endsWith(".jpeg")) {
              tipo = "image/jpeg";
            }
            const blob = new Blob([bytes], { type: tipo });
            const url = URL.createObjectURL(blob);
            setArchivo({ url, tipo });
          } else {
            setArchivo(null);
          }
        }
      } catch (error) {
        logError(error);
      } finally {
        setCargando(false);
      }
    };
    cargarIncidencia();
  }, [idInt]);

  if (cargando) return (
    <div className="admin-page-container">
      <div className="admin-loading">{t("incidents.loading")}</div>
    </div>
  );

  if (!incidencia) return (
    <div className="admin-page-container">
      <div className="admin-error">{t("incidents.not_found")}</div>
    </div>
  );

  return (
    <div className="admin-page-container">
      <div className="admin-content-wrap">
        <div className="admin-page-header">
          <h1 className="admin-page-title">{t("incidents.detail_title")} #{idInt}</h1>
        </div>

        <div className="detalle-incidencia-grid">
          <div className="admin-card detalle-incidencia-info-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <span className="admin-card-icon">ℹ️</span>
                {t("incidents.detail_title")}
              </h2>
            </div>
            <div className="admin-card-body">
              <div className="info-item">
                <label className="admin-label">{t("incidents.status")}</label>
                <span className={`admin-badge ${incidencia.estado_incidencia === 'SOLUCIONADA' ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                  {incidencia.estado_incidencia}
                </span>
              </div>
              <div className="info-item admin-mt-md">
                <label className="admin-label">{t("incidents.creation_date")}</label>
                <p>{formatearFecha(incidencia.fecha_creacion)}</p>
              </div>
              <div className="info-item admin-mt-md">
                <label className="admin-label">{t("incidents.type")}</label>
                <p>{incidencia.tipo_incidencia}</p>
              </div>
              <div className="info-item admin-mt-md">
                <label className="admin-label">{t("incidents.description")}</label>
                <p className="descripcion-texto">{incidencia.descripcion}</p>
              </div>
            </div>
          </div>

          {archivo && (
            <div className="admin-card detalle-incidencia-archivo-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  <span className="admin-card-icon">📎</span>
                  {t("incidents.attached_file")}
                </h2>
              </div>
              <div className="admin-card-body">
                <div className="archivo-preview">
                  {archivo.tipo === "application/pdf" ? (
                    <iframe src={archivo.url} title={t("incidents.attached_file")} className="archivo-iframe" />
                  ) : (
                    <img src={archivo.url} alt={t("incidents.attached_file")} className="archivo-img" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ height: "80px" }} />
    </div>
  );
}
