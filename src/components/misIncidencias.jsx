import { useEffect, useState } from "react";
import "../styles/misIncidencias-style.css";
import { useNavigate } from "react-router-dom";
import { obtenerIncidenciasAsignadasUsuario } from "../services/incidencia";
import { formatearFecha } from "../lib/formateadorFechas.js";
import { logError } from "../lib/logger.js";

export default function MisIncidencias() {
  const navigate = useNavigate();
  const [incidencias, setIncidencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("abierta");

  useEffect(() => {
    const cargarIncidencias = async () => {
      try {
        const data = await obtenerIncidenciasAsignadasUsuario();
        setIncidencias(data.result.result);
      } catch (error) {
        logError(error);
      } finally {
        setCargando(false);
      }
    };
    cargarIncidencias();
  }, []);

  // Filtrar las incidencias según el estado seleccionado
  const incidenciasFiltradas = incidencias.filter(
    (incidencia) => incidencia.estado_incidencia === filtroEstado
  );

  return (
    <>
      <div className="header">
        <h1>Mis Incidencias</h1>
      </div>
      <div className="subheader">
        <p>Consulta el estado de tus incidencias podrás filtarla por tipo con el selector.</p>
      </div>
      <div className="filtro-container">
        <label htmlFor="filtroEstado">Filtrar por estado:</label>
        <select
          id="filtroEstado"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="abierta">Abiertas</option>
          <option value="asignada">En curso</option>
          <option value="solucionada">Solucionadas</option>
        </select>
      </div>
      <div className="contenedorIncidencia">
        {cargando ? (
          <p className="loading-message">Cargando incidencias...</p>
        ) : incidenciasFiltradas.length === 0 ? (
          <div className="no-incidencias">
            <p>No tienes incidencias registradas con el estado seleccionado.</p>
            <button
              onClick={() => navigate("/reportarIncidencia")}
              className="big-button"
            >
              Reportar Incidencia
            </button>
          </div>
        ) : (
          <div className="incidencias-container">
            {incidenciasFiltradas.map((incidencia) => (
              <div key={incidencia.id} className="incidencia-card">
                <p><strong>Estado:</strong> {incidencia.estado_incidencia}</p>
                <p><strong>Fecha de creación:</strong> {formatearFecha(incidencia.fecha_creacion)}</p>
                <p><strong>Tipo de Incidencia:</strong>{incidencia.tipo_incidencia}</p>
                <p><strong>Descripción:</strong> {incidencia.descripcion}</p>
              </div>
            ))}
          </div>
        )}
        <div style={{ height: "80px" }} />
      </div>
    </>
  );
}
