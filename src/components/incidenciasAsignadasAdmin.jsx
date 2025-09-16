import { useEffect, useState } from "react";
import "../styles/misIncidencias-style.css";
import { obtenerIncidenciasAsignadasAdmin, solucionarIncidencia } from "../services/incidencia";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { logError } from "../lib/logger.js";
import { notificarCierreIncidencia } from "../services/notificacion";

export default function IncidenciasAsignadasAdmin() {
  const [incidencias, setIncidencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [mensajeCierre, setMensajeCierre] = useState("");
  const [incidenciaAResolver, setIncidenciaAResolver] = useState(null);
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

  const handleAbrirModal = (idIncidencia) => {
    setIncidenciaAResolver(idIncidencia);
    setMensajeCierre("");
    setModalOpen(true);
  };

  const handleCerrarModal = () => {
    setModalOpen(false);
    setMensajeCierre("");
    setIncidenciaAResolver(null);
  };

  const handleEnviarMensajeYCerrar = async () => {
    if (!mensajeCierre.trim()) {
      toast.error("El mensaje no puede estar vacío");
      return;
    }
    try {
      await notificarCierreIncidencia(incidenciaAResolver, mensajeCierre);
      await handleResolverIncidencia(incidenciaAResolver);
      handleCerrarModal();
    } catch (error) {
      toast.error("Error al notificar el cierre de la incidencia");
      logError(error);
    }
  };

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
                <button className="big-button" onClick={() => handleAbrirModal(incidencia.id)}>Resolver Incidencia</button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Modal */}
      {modalOpen && (
        <>
          <div className="modal-overlay"></div>
          <div className="modal">
            <h3>Mensaje de cierre de incidencia</h3>
            <textarea
              value={mensajeCierre}
              onChange={e => setMensajeCierre(e.target.value)}
              placeholder="Escribe el mensaje que se enviará al usuario..."
              rows={4}
              style={{ width: "100%" }}
            />
            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
              <button onClick={handleEnviarMensajeYCerrar} className="big-button">Enviar y cerrar</button>
              <button onClick={handleCerrarModal} className="verIncidencia-button">Cancelar</button>
            </div>
          </div>
        </>
      )}
      <div style={{ height: "80px" }} /> {/* Espacio para el footer */}
    </>
  );
}
