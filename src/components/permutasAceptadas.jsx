import { useState, useEffect } from "react";
import "../styles/permutas-style.css";
import { obtenerPermutasAgrupadasPorUsuario, generarBorradorPermuta } from "../services/permuta.js";
import { useNavigate } from "react-router-dom";
import { obtenerSesion } from "../services/login.js";
export default function PermutasAceptadas() {
  const [permutas, setPermutas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    obtenerPermutasAgrupadas();
    obtenerDatosUsuario();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const obtenerPermutasAgrupadas = async () => {
    try {
      const response = await obtenerPermutasAgrupadasPorUsuario();
      if (
        response &&
        response.result &&
        Array.isArray(response.result.result)
      ) {
        setPermutas(response.result.result);
      } else {
        console.error("Formato de respuesta inesperado:", response);
        setError("Error al cargar los datos");
      }
      setCargando(false);
    } catch (error) {
      console.error(
        "Error al obtener las permutas agrupadas por usuario:",
        error
      );
      setError("Error al obtener las permutas agrupadas por usuario");
      setCargando(false);
    }
  };

  const obtenerDatosUsuario = async () => {
    try {
      const response = await obtenerSesion();
      if (response) {
        setUsuario(response);
        console.log("Usuario:", usuario);
      } else {
        setError("Error al cargar los datos del usuario");
      }
    } catch (error) {
      setError("Error al obtener los datos del usuario",error);
    }
  };


  const handleGenerarPermuta = async (IdsPermuta) => {
    try {
      await generarBorradorPermuta(IdsPermuta);
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
      {cargando ? (
        <div>Cargando permutas...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : permutas.length > 0 ? (
        <div className="permutas-grid">
          {permutas.map((grupoPermuta, index) => {
            const usuarios = grupoPermuta.usuarios ?? [];
            const permutasDetalles = grupoPermuta.permutas ?? [];
            const todasValidadas = permutasDetalles.every((permuta) => permuta.estado === "VALIDADA");
            const todasFinalizadas = permutasDetalles.every((permuta) => permuta.estado === "FINALIZADA");
            const IdsPermuta = permutasDetalles.map((permuta) => permuta.permuta_id);

            // Saltar si los datos son incompletos
            if (usuarios.length < 2 || permutasDetalles.length === 0) {
              return null;
            }
  
            return (
              <div key={index} className="permuta-card">
                <div className="permuta-info">
                  <p>
                    <strong>Alumno 1:</strong> {usuarios[0]}
                  </p>
                  <p>
                    <strong>Alumno 2:</strong> {usuarios[1]}
                  </p>

                  {permutasDetalles.map((permuta) => (
                    <div key={permuta.permuta_id} className="permuta-detalle">
                      <p>
                        <strong>Asignatura:</strong> {permuta.nombre_asignatura}
                      </p>
                      <p>
                        <strong>Código:</strong> {permuta.codigo_asignatura}
                      </p>
                      <p>
                        <strong>Grupo {usuarios[0]}:</strong> {permuta.grupo_1}
                      </p>
                      <p>
                        <strong>Grupo {usuarios[1]}:</strong> {permuta.grupo_2}
                      </p>
                      <hr />
                    </div>
                  ))}
                </div>
                <button className="aceptar-btn" disabled= {!todasValidadas} onClick={() => handleGenerarPermuta(IdsPermuta)}>Generar Permuta</button>
                <button className="ver-btn" disabled= {!todasFinalizadas} onClick={() => navigate("/generarPermuta")}>Ver Permuta</button>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No hay permutas aceptadas</p>
      )}
    </div>
  );
}
