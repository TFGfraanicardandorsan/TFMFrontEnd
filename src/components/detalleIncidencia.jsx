import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/detalleIncidencia-style.css";
import { obtenerIncidenciaPorId } from "../services/incidencia";

export default function DetalleIncidencia() {
  const { id } = useParams();
  const [incidencia, setIncidencia] = useState(null);
  const [archivoUrl, setArchivoUrl] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarIncidencia = async () => {
      try {
        const data = await obtenerIncidenciaPorId(id);
        setIncidencia(data.result.result);
        setArchivoUrl(data.result.result.url);
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
        <p><strong>Fecha de creación:</strong> {incidencia.fechaCreacion}</p>
        <p><strong>Prioridad:</strong> {incidencia.prioridad}</p>
      </div>
      {archivoUrl && (
        <div className="detalle-incidencia-archivo">
          <strong>Archivo adjunto:</strong>
          <iframe src={archivoUrl} title="Archivo adjunto" />
        </div>
      )}
    </div>
  );
}
