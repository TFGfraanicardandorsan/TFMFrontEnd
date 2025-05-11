import { useState, useEffect } from "react";
import "../styles/miPerfil-style.css";
import { obtenerDatosUsuario } from "../services/usuario"; 
import { obtenerMiGrupoAsignatura } from "../services/grupo"; // Importar la nueva API
import {superarAsignaturasUsuario} from "../services/asignaturas"; // Importar la nueva API
import SeleccionarEstudio from "./seleccionarEstudio";
import { useNavigate } from "react-router-dom";
export default function MiPerfil() {
  const [usuario, setUsuario] = useState(null); // Estado para almacenar los datos del usuario
  const [asignaturas, setAsignaturas] = useState([]); // Estado para almacenar las asignaturas y grupos
  const [loading, setLoading] = useState(true); // Estado para la carga de datos
  const [error, setError] = useState(null); // Estado para manejar errores
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // Obtener datos del usuario
        const responseUsuario = await obtenerDatosUsuario();
        if (!responseUsuario.err) {
          setUsuario(responseUsuario.result.result);
        } else {
          throw new Error(responseUsuario.errmsg);
        }
        // Obtener asignaturas y grupos
        const responseAsignaturas = await obtenerMiGrupoAsignatura();
        if (!responseAsignaturas.err) {
          setAsignaturas(responseAsignaturas.result.result);
        } else {
          throw new Error(responseAsignaturas.errmsg);
        }
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    obtenerDatos();
  }, []);

  // Función para marcar una asignatura como aprobada
  const manejarSuperarAsignatura = async (idAsignatura,codigo) => {
    try {
      const response = await superarAsignaturasUsuario(codigo);
      if (!response.err) {
        // Actualizar el estado local eliminando la asignatura aprobada
        setAsignaturas(asignaturas.filter(asignatura => asignatura.id !== idAsignatura));
      } else {
        throw new Error(response.errmsg);
      }
    } catch (error) {
      setError(error.message);
    }
  };
  // Muestra mensaje de carga
  if (loading) {
    return <div className="loading-text">Cargando...</div>;
  }
  // Muestra mensaje de error si hubo un problema
  if (error) {
    return <div className="error-text">Error: {error}</div>;
  }

  return (
    <div className="page-container">
      {/* Mostrar SeleccionarEstudio solo si no hay grado */}
      {!usuario?.titulacion && <SeleccionarEstudio />}
      <div className="content-wrap">
        <div className="perfil-container">
          <h1 className="perfil-title">Mi Perfil</h1>
          <div className="perfil-content">
            <div className="perfil-card">
              <h2 className="perfil-card-title">Información Personal</h2>
              <p><strong>Nombre:</strong> {usuario.nombre_completo}</p>
              <p><strong>Correo:</strong> {usuario.correo}</p>
              <p><strong>Grado:</strong> {usuario.titulacion}</p>
            </div>
  
            <div className="perfil-card">
              <h2 className="perfil-card-title">Asignaturas y Grupos</h2>
              <ul>
                {asignaturas.length > 0 ? (
                  asignaturas.map((asignatura) => (
                    <li key={asignatura.id}>
                      <strong>{asignatura.asignatura}:</strong> Grupo {asignatura.numgrupo}
                      <button
                        className="aprobar-btn"
                        onClick={() => manejarSuperarAsignatura(asignatura.id , asignatura.codigo)}
                      >
                        Marcar como aprobada
                      </button>
                    </li>
                  ))
                ) : (
                  <p>No tienes asignaturas registradas.</p>
                )}
              </ul>
              <hr className="separadorSelectorAsignatura" />
              <button className="aprobar-btn" onClick={() => navigate("/seleccionarAsignaturas")}>Selecciona tus asignaturas</button>
            </div>
          </div>
        </div>
      </div>
      <br /><br /><br />
      <br /><br /><br />
    </div>
  );
}