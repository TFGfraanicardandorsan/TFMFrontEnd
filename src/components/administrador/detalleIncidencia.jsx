import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/detalleIncidencia-style.css";
import { obtenerIncidenciaPorId } from "../../services/incidencia.js";
import { formatearFecha } from "../../lib/formateadorFechas.js";
import { servirArchivo } from "../../services/subidaArchivos.js";
import { logError } from "../../lib/logger.js";
import { useTranslation } from "react-i18next";
import { translateIncidentStatus, translateIncidentType } from "../../lib/i18nLabels.js";

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
        setIncidencia(data.result.result);
        const nombreArchivo = data.result.result.archivo;
        if (nombreArchivo) {
          const bytes = await servirArchivo("archivador", nombreArchivo);

          let tipo = "application/pdf";
          if (nombreArchivo.toLowerCase().endsWith(".png")) {
            tipo = "image/png";
          }
          const blob = new Blob([bytes], { type: tipo });
          const url = URL.createObjectURL(blob);
          setArchivo({ url, tipo });
        } else {
          setArchivo(null);
        }
      } catch (error) {
        logError(error);
      } finally {
        setCargando(false);
      }
    };
    cargarIncidencia();
  }, [idInt]);

  if (cargando) return <p>{t("admin.incidents.detail_loading")}</p>;
  if (!incidencia) return <p>{t("admin.incidents.detail_not_found")}</p>;

  return (
    <div className="detalle-incidencia-container">
      <div className="detalle-incidencia-info">
        <h2>{t("admin.incidents.detail_title", { id: idInt })}</h2>
        <p><strong>{t("common.status")}:</strong> {translateIncidentStatus(t, incidencia.estado_incidencia)}</p>
        <p><strong>{t("common.created_at")}:</strong> {formatearFecha(incidencia.fecha_creacion)}</p>
        <p><strong>{t("admin.incidents.type_label")}:</strong> {translateIncidentType(t, incidencia.tipo_incidencia)}</p>
        <p><strong>{t("common.description_label")}:</strong> {incidencia.descripcion}</p>
      </div>
      {archivo && (
        <div className="detalle-incidencia-archivo">
          {archivo.tipo === "application/pdf" ? (
            <iframe src={archivo.url} title={t("common.file_attachment")} />
          ) : (
            <img src={archivo.url} alt={t("common.file_attachment")} style={{ maxWidth: "100%", maxHeight: "600px" }} />
          )}
        </div>
      )}
    </div>
  );
}
