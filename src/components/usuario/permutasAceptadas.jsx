import { useState, useEffect } from "react";
import "../styles/permutas-style.css";
import { obtenerPermutasAgrupadasPorUsuario, generarBorradorPermuta } from "../../services/permuta.js";
import { useNavigate } from "react-router-dom";
import { obtenerSesion } from "../../services/login.js";
import { toast } from "react-toastify";
import { logError } from "../../lib/logger.js";

export default function PermutasAceptadas() {
  const [permutas, setPermutas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    obtenerPermutasAgrupadas();
    obtenerDatosUsuario();
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
        setError("Error al cargar los datos");
        logError(response);
      }
      setCargando(false);
    } catch (error) {
      setError("Error al obtener las permutas agrupadas por usuario");
      setCargando(false);
      logError(error);
    }
  };

  const obtenerDatosUsuario = async () => {
    try {
      const response = await obtenerSesion();
      if (response) {
        setUsuario(response.user.uvus);
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
      toast.success("Permuta generada con éxito");
      navigate("/generarPermuta");
    } catch (error) {
      toast.error("Error al generar la permuta");
      setError("Error al generar la permuta");
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
      <h2>Permutas aceptadas</h2>
      <p className="subtitulo">
        Selecciona las permutas que deseas generar. Puedes generar una permuta por cada grupo de asignaturas que vayas a permutar con un estudiante. Puedes generar más de una permuta que tendrás que enviar a la escuela.</p>
      {cargando ? (
        <div>Cargando permutas...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : permutas.length > 0 ? (
        <div className="permutas-grid">
          {permutas.map((grupoPermuta, index) => {
            const usuarios = grupoPermuta.usuarios ?? [];
            const permutasDetalles = grupoPermuta.permutas ?? [];
            const todasNull = permutasDetalles.every((permuta) => permuta.estado_permuta_asociada === null);
            const todasBorrador = permutasDetalles.every((permuta) => permuta.estado_permuta_asociada === "BORRADOR");
            const puedeGenerarPermuta = usuario === usuarios[0] && todasNull
            const puedeContinuarPermuta = usuario === usuarios[0] && todasBorrador;
            const todasFirmadas = permutasDetalles.length > 0 && permutasDetalles.every((permuta) => permuta.estado_permuta_asociada === "FIRMADA");
            const puedeCompletarPermuta = usuario === usuarios[1] && todasFirmadas; 
            const todasFinalizadas = permutasDetalles.every((permuta) => (permuta.estado_permuta_asociada === "ACEPTADA" || permuta.estado_permuta_asociada === "VALIDADA"));
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
                {puedeGenerarPermuta && (
                <button className="aceptar-btn" onClick={() => handleGenerarPermuta(IdsPermuta)}>Generar Permuta</button>
          )}
            {puedeContinuarPermuta && (
             <button className="aceptar-btn"  onClick={() => navigate("/generarPermuta")}>Continuar Permuta</button>
       )}
          {puedeCompletarPermuta && (
                <button className="aceptar-btn"  onClick={() => navigate("/generarPermuta")}>Completar Permuta</button>
          )}
                {todasFinalizadas && (
                <button className="ver-btn"  onClick={() => navigate("/generarPermuta")}>Ver Permuta</button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p>No hay permutas aceptadas</p>
      )}
<div style={{ height: "80px" }} />
    </div>
    
  );
}
