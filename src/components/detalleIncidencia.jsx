import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/detalleIncidencia-style.css";
import { obtenerIncidenciaPorId } from "../services/incidencia";
import { formatearFecha } from "../lib/formateadorFechas.js";
import { servirArchivo } from "../services/subidaArchivos.js";

export default function DetalleIncidencia() {
  const { id } = useParams();
  const [incidencia, setIncidencia] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(true);

useEffect(() => {
  const cargarIncidencia = async () => {
    try {
      console.log("ID de incidencia:", id);
      const data = await obtenerIncidenciaPorId(id);
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
      console.error("Error al obtener la incidencia:", error);
    } finally {
      setCargando(false);
    }
  };
  cargarIncidencia();
}, [id]);

  if (cargando) return <p>Cargando incidencia...</p>;
  if (!incidencia) return <p>No se encontró la incidencia.</p>;

  return (
    <div className="detalle-incidencia-container">
      <div className="detalle-incidencia-info">
        <h2>Detalle de la Incidencia</h2>
        <p><strong>Descripción:</strong> {incidencia.descripcion}</p>
        <p><strong>Tipo de Incidencia:</strong> {incidencia.tipo_incidencia}</p>
        <p><strong>Estado:</strong> {incidencia.estado_incidencia}</p>
        <p><strong>Fecha de creación:</strong> {formatearFecha(incidencia.fecha_creacion)}</p>
      </div>
    {archivo && (
      <div className="detalle-incidencia-archivo">
        <strong>Archivo adjunto:</strong>
        {archivo.tipo === "application/pdf" ? (
          <iframe src={archivo.url} title="Archivo adjunto" />
          ) : (
          <img src={archivo.url} alt="Archivo adjunto" style={{ maxWidth: "100%", maxHeight: "600px" }} />
          )}
      </div>
    )}
    </div>
  );
}
