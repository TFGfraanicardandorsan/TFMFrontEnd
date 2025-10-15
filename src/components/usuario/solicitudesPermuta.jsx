import { useState, useEffect } from "react";
import "../styles/solicitudesPermuta-style.css";
import { obtenerSolicitudesPermuta } from "../../services/permuta";

export default function SolicitudesPermuta() {
  const [solicitudes, setSolicitudes] = useState([]); // Estado para almacenar las solicitudes
  const [loading, setLoading] = useState(true); // Estado para la carga de datos
  const [error, setError] = useState(null); // Estado para manejar errores
  const [filtroEstado, setFiltroEstado] = useState("todas"); // Estado para el filtro

  useEffect(() => {
    const obtenerSolicitudes = async () => {
      try {
        const response = await obtenerSolicitudesPermuta();
        if (!response.err) {
          setSolicitudes(response.result.result); // Guardar las solicitudes en el estado
        } else {
          throw new Error(response.errmsg);
        }
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    obtenerSolicitudes();
  }, []);

  // Muestra mensaje de carga
  if (loading) {
    return <div className="loading-text">Cargando solicitudes...</div>;
  }

  // Muestra mensaje de error si hubo un problema
  if (error) {
    return <div className="error-text">Error: {error}</div>;
  }

  // Filtrar las solicitudes según el estado seleccionado
  const solicitudesFiltradas =
    filtroEstado === "todas"
      ? solicitudes
      : solicitudes.filter((solicitud) => solicitud.estado === filtroEstado);

  return (
    <div className="page-container">
      <div className="content-wrap">
        <div className="solicitudes-container">
          <h1 className="solicitudes-title">Mis Solicitudes de Permuta</h1>
          <p className="solicitudes-description">
            Aquí puedes ver todas tus solicitudes de permuta. Puedes filtrar por estado para encontrar más fácilmente lo que buscas. 
            <br />
            Si no tienes solicitudes registradas, puedes <a href="/solicitarPermuta" className="link">solicitar una permuta clickando aquí</a>.
            </p>
          {/* Selector para filtrar por estado */}
          <div className="filtro-container">
            <label htmlFor="filtroEstado">Filtrar por estado:</label>
            <select
              id="filtroEstado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todas">Todas</option>
              <option value="SOLICITADA">Solicitadas</option>
              <option value="EMPAREJADA">Emparejadas</option>
            </select>
          </div>

          <div className="solicitudes-content">
            {solicitudesFiltradas.length > 0 ? (
              solicitudesFiltradas.map((solicitud) => (
                <div key={solicitud.solicitud_id} className="solicitud-card">
                  <p>
                    <strong>Asignatura:</strong> {solicitud.nombre_asignatura} (
                    {solicitud.codigo_asignatura}) -
                    <br />
                    <strong> Grupo Actual:</strong> {solicitud.grupo_solicitante}
                  </p>
                  <p>
                    <strong>Grupos Deseados: </strong>
                    {solicitud.grupos_deseados.join(", ")}
                  </p>
                  <p>
                    <strong>Estado:</strong> {solicitud.estado}
                  </p>
                </div>
              ))
            ) : (
              <p>No tienes solicitudes de permuta registradas.</p>
            )}
          </div>
        </div>
      </div>
      <div className="footer-space"></div>
    </div>
  );
}