import { useEffect, useState } from "react";
import "../styles/misIncidencias-style.css";
import { obtenerIncidenciasAsignadasAdmin, solucionarIncidencia } from "../services/incidencia";
import { useNavigate } from "react-router-dom";

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
        console.error("Error al obtener las incidencias:", error);
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
        alert(`Incidencia ${idIncidencia} resuelta correctamente`);
      } else {
        throw new Error(response.errmsg);
      }
    } catch (error) {
      console.error("Error al resolver la incidencia:", error);
      alert(`Error al resolver la incidencia ${idIncidencia}`);
    }
  };
  return (
    <>
      <div className="container" style={{ display: "flow", paddingBottom: "40px" }}>
        <div className="header">
          <h1>Mis Incidencias</h1>
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
                <p>
                  <strong>Tipo de Incidencia:</strong> {incidencia.descripcion}
                </p>
                <p>
                  <strong>Estado:</strong> {incidencia.estado_incidencia}
                </p>
                <p>
                  <strong>Comentario:</strong> {incidencia.tipo_incidencia}
                </p>
                <button className="verIncidencia-button" onClick={() => navigate(`/incidencias/${incidencia.id}`)}>Ver incidencia</button>
                <button className="big-button" onClick={() => handleResolverIncidencia(incidencia.id)}>Resolver Incidencia</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
