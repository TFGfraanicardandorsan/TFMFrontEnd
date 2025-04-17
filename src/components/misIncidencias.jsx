import { useEffect, useState } from "react";
import "../styles/misIncidencias-style.css";
import Footer from "./footer";
import Navbar from "./navbar";
import { useNavigate } from "react-router-dom";
import { obtenerIncidenciasAsignadasUsuario } from "../services/incidencia";
import { formatearFecha } from "../lib/formateadorFechas.js";

export default function MisIncidencias() {
  const navigate = useNavigate();
  const [incidencias, setIncidencias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarIncidencias = async () => {
      try {
        const data = await obtenerIncidenciasAsignadasUsuario();
        setIncidencias(data.result.result);
      } catch (error) {
        console.error("Error al obtener las incidencias:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarIncidencias();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="header">
          <h1>Mis Incidencias</h1>
        </div>
        {cargando ? (
          <p className="loading-message">Cargando incidencias...</p>
        ) : incidencias.length === 0 ? (
          <div className="no-incidencias">
            <p>No tienes incidencias registradas.</p>
            <button
              onClick={() => navigate("/reportarIncidencia")}
              className="big-button"
            >
              Solicitar Incidencia
            </button>
          </div>
        ) : (
          <div className="incidencias-container">
            {incidencias.map((incidencia) => (
              <div key={incidencia.id} className="incidencia-card">
                <p>
                  <strong>Incidencia:</strong> {formatearFecha(incidencia.fecha_creacion)}
                </p>
                <p>
                  <strong>Tipo de Incidencia:</strong>{" "}
                  {incidencia.tipo_incidencia}
                </p>
                <p>
                  <strong>Estado:</strong> {incidencia.estado_incidencia}
                </p>
                <p>
                  <strong>Comentario:</strong> {incidencia.descripcion}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
