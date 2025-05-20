import { useEffect, useState } from "react";
import "../styles/misIncidencias-style.css";
import { obtenerIncidenciasAsignadasAdmin, solucionarIncidencia } from "../services/incidencia";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { logError } from "../lib/logger.js";

export default function IncidenciasAsignadasAdmin() {
  const [incidencias, setIncidencias] = useState([]);
  const [cargando, setCargando] = useState(true);
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

  const handleResolverIncidencia = async (idIncidencia) => {
    try {
      const response = await solucionarIncidencia(idIncidencia);
      if (!response.err) {
        setIncidencias(incidencias.filter((incidencia) => incidencia.id !== idIncidencia));
        toast.success(`Incidencia ${idIncidencia} resuelta correctamente`);
      } else {
        logError(response.errmsg);
      }
    } catch (error) {
      toast.error(`Error al resolver la incidencia ${idIncidencia}`);
      logError(error);
    }
  };
  return (
    <>
      <div className="container" style={{ display: "flow", paddingBottom: "40px" }}>
        <div className="header">
          <h1>Mis Incidencias</h1>
          <p>Consulta el estado de tus incidencias. Puedes resolverlas haciendo clic en el botón correspondiente. Si presionas en ver incidencia verás el archivo adjunto si el usuario adjuntó algo.</p>
        </div>
        {cargando ? (
          <p className="loading-message">Cargando incidencias...</p>
        ) : incidencias.length === 0 ? (
          <div className="no-incidencias">
            <p>No tienes incidencias abiertas.</p>
          </div>
        ) : (
          <div className="incidencias-container">
            {incidencias.map((incidencia) => (
              <div key={incidencia.id} className="incidencia-card">
                <h2 className="incidencia-title">Incidencia {incidencia.id}</h2>
                <p><strong>Fecha de Creación:</strong> {new Date(incidencia.fecha_creacion).toLocaleDateString()}</p>
                <p><strong>Estado:</strong> {incidencia.estado_incidencia}</p>
                <p><strong>Tipo de Incidencia:</strong> {incidencia.tipo_incidencia}</p>
                <p><strong>Descripción:</strong> {incidencia.descripcion}</p>
                <button className="verIncidencia-button" onClick={() => navigate(`/incidencias/${incidencia.id}`)}>Ver incidencia</button>
                <button className="big-button" onClick={() => handleResolverIncidencia(incidencia.id)}>Resolver Incidencia</button>
              </div>
            ))}
          </div>
        )}
      </div>
<div style={{ height: "80px" }} /> {/* Espacio para el footer */}
    </>
  );
}
