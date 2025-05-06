import { useState, useEffect } from "react";
import "../styles/permutas-style.css";
import { obtenerPermutasAgrupadasPorUsuario, generarPermuta } from "../services/permuta.js";
import { useNavigate } from "react-router-dom";
export default function PermutasAceptadas() {
  const [permutas, setPermutas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    obtenerPermutasAgrupadas();
  }, []);

  const obtenerPermutasAgrupadas = async () => {
    try {
      const response = await obtenerPermutasAgrupadasPorUsuario();
      if (response && response.result && Array.isArray(response.result.result)) {
        setPermutas(response.result.result);
      } else {
        console.error("Formato de respuesta inesperado:", response);
        setError("Error al cargar los datos");
      }
      setCargando(false);
    } catch (error) {
      console.error("Error al obtener las permutas agrupadas por usuario:", error);
      setError("Error al obtener las permutas agrupadas por usuario");
      setCargando(false);
    }
  };

  const handleGenerarPermuta = async (solicitudId) => {
    try {
      await generarPermuta(solicitudId);
      navigate("/generarPermuta"); 
      alert("Permuta generada con éxito");
    } catch (error) {
      console.error("Error al generar la permuta:", error);
      alert("Error al generar la permuta");
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
      <h2>Permutas aceptadas</h2>
      {permutas.length > 0 ? (
        <div className="permutas-grid">
          {permutas.map((permuta) => (
            <div key={permuta.solicitud_id} className="permuta-card">
              <div className="permuta-info">
                <p><strong>Nombre Asignatura:</strong> {permuta.nombre_asignatura}</p>
                <p><strong>Código Asignatura:</strong> {permuta.codigo_asignatura}</p>
                <p><strong>Grupo:</strong> {permuta.grupo}</p>
              </div>
              <button className="aceptar-btn" onClick={() => handleGenerarPermuta(permuta.solicitud_id)}>Generar Permuta</button>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay permutas aceptadas</p>
      )}
    </div>
  );
}
