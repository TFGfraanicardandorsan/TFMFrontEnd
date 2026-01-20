import { useState, useEffect } from "react";
import "../../styles/permutas-style.css";
import { obtenerPermutasInteresantes, aceptarPermutaSolicitudesPermuta } from "../../services/permuta.js";
import { useNavigate } from "react-router-dom";
import { logError } from "../../lib/logger.js";
import { toast } from "react-toastify";

export default function Permutas() {
  const [permutas, setPermutas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarPermutas();
  }, []);

  const cargarPermutas = async () => {
    try {
      const response = await obtenerPermutasInteresantes();
      if (response && response.result && Array.isArray(response.result.result)) {
        setPermutas(response.result.result);
      } else {
        setError("Error al cargar los datos");
        logError(response);
      }
      setCargando(false);
    } catch (error) {
      setError("Error al cargar las permutas");
      setCargando(false);
      logError(error);
    }
  };

  const handleAceptarPermuta = async (solicitudId) => {
    try {
      await aceptarPermutaSolicitudesPermuta(solicitudId);
      toast.success("Permuta aceptada correctamente");
      navigate("/misPermutas");
    } catch (error) {
      toast.error("Error al aceptar la permuta");
      setError("Error al aceptar la permuta");
      logError(error);
    }
  };

  if (cargando) {
    return <div>Cargando permutas...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="permutas-container">
      <h2 className="permutas-title">Permutas Disponibles</h2>
      <p className="permutas-description">
        Aquí puedes ver las permutas disponibles que puedan ser interesantes para ti, es decir de las asignaturas de las que estés matriculado y de los grupos a los que pertenezcas. Si estás interesado en alguna, puedes aceptarla para que si el estudiante que la propone le parece bien podáis permutar los grupos.
      </p>
      {permutas.length > 0 ? (
        <div className="permutas-grid">
          {permutas.map((permuta) => (
            <div key={permuta.solicitud_id} className="permuta-card">
              <div className="permuta-info">
                <p><strong>Permuta de:</strong> <i>{permuta.siglas_asignatura}</i></p>
                <p><strong>Estado:</strong> {permuta.estado}</p>
                <p><strong>Grupo Solicitante:</strong> {permuta.grupo_solicitante}</p>
                <p><strong>Grupos Deseados:</strong> {permuta.grupo_deseado}</p>
                <p><strong>Código Asignatura:</strong> {permuta.codigo_asignatura}</p>
              </div>
              <button
                className="aceptar-btn"
                onClick={() => handleAceptarPermuta(permuta.solicitud_id)}>
                Aceptar Permuta
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay permutas disponibles</p>
      )}
      <div style={{ height: "80px" }} />
    </div>
  );
}
