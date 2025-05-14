import { useState, useEffect } from "react";
import "../styles/permutas-style.css";
import { obtenerPermutasInteresantes, aceptarPermutaSolicitudesPermuta } from "../services/permuta.js";
export default function Permutas() {
  const [permutas, setPermutas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarPermutas();
  }, []);

  const cargarPermutas = async () => {
    try {
      const response = await obtenerPermutasInteresantes();
      if (response && response.result && Array.isArray(response.result.result)) {
        setPermutas(response.result.result);
      } else {
        console.error("Formato de respuesta inesperado:", response);
        setError("Error al cargar los datos");
      }
      setCargando(false);
    } catch (error) {
      console.error("Error al cargar las permutas:", error);
      setError("Error al cargar las permutas");
      setCargando(false);
    }
  };

  const handleAceptarPermuta = async (solicitudId) => {
    try {
      await aceptarPermutaSolicitudesPermuta(solicitudId);
      await cargarPermutas(); // Recargar las permutas después de aceptar
      alert("Permuta aceptada con éxito");
    } catch (error) {
      console.error("Error al aceptar la permuta:", error);
      alert("Error al aceptar la permuta");
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
      <h2>Permutas Disponibles</h2>
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
                onClick={() => handleAceptarPermuta(permuta.solicitud_id)}
                disabled={permuta.estado !== "SOLICITADA"}
              >
                Aceptar Permuta
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay permutas disponibles</p>
      )}
    </div>
  );
}
