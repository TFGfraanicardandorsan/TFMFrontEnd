import { useState, useEffect } from "react";
// import "../styles/solicitudesPermuta-style.css";
import Footer from "./footer";
import Navbar from "./navbar";
import { obtenerSolicitudesPermuta } from "../services/permuta"; // Importar la API para obtener solicitudes

export default function SolicitudesPermuta() {
  const [solicitudes, setSolicitudes] = useState([]); // Estado para almacenar las solicitudes
  const [loading, setLoading] = useState(true); // Estado para la carga de datos
  const [error, setError] = useState(null); // Estado para manejar errores

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

  return (
    <div className="page-container">
      <Navbar />
      <div className="content-wrap">
        <div className="solicitudes-container">
          <h1 className="solicitudes-title">Mis Solicitudes de Permuta</h1>
          <div className="solicitudes-content">
            {solicitudes.length > 0 ? (
              solicitudes.map((solicitud) => (
                <div key={solicitud.solicitud_id} className="solicitud-card">
                  <p><strong>Asignatura:</strong> {solicitud.nombre_asignatura} ({solicitud.codigo_asignatura})</p>
                  <p><strong>Grupo Solicitante:</strong> {solicitud.grupo_solicitante}</p>
                  <p><strong>Grupo Deseado:</strong> {solicitud.grupo_deseado}</p>
                  <p><strong>Estado:</strong> {solicitud.estado}</p>
                </div>
              ))
            ) : (
              <p>No tienes solicitudes de permuta registradas.</p>
            )}
          </div>
        </div>
      </div>
      <div className="footer-space"></div>
      <Footer />
    </div>
  );
}