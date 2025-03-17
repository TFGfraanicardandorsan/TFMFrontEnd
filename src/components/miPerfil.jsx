import { useState, useEffect } from "react";
import "../styles/miPerfil-style.css";
import Footer from "./footer";
import Navbar from "./navbar";
import { obtenerDatosUsuario } from "../services/usuario"; // Servicio para obtener datos del usuario
import { obtenerTodosGruposMisAsignaturasUsuario, obtenerMiGrupoAsignatura } from "../services/grupo"; // Nuevo servicio para asignaturas y grupos

export default function MiPerfil() {
  const [usuario, setUsuario] = useState(null); // Estado para almacenar los datos del usuario
  const [asignaturas, setAsignaturas] = useState([]); // Estado para almacenar las asignaturas y grupos
  const [loading, setLoading] = useState(true); // Estado para la carga de datos
  const [error, setError] = useState(null); // Estado para manejar errores

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
      <Navbar />
      <div className="content-wrap">
        <div className="perfil-container">
          <h1 className="perfil-title">Mi Perfil</h1>
          <div className="perfil-content">
            {/* Información Personal */}
            <div className="perfil-card">
              <h2 className="perfil-card-title">Información Personal</h2>
              <p><strong>Nombre:</strong> {usuario.nombre_completo}</p>
              <p><strong>Correo:</strong> {usuario.correo}</p>
              <p><strong>Grado:</strong> {usuario.titulacion}</p>
            </div>

            {/* Asignaturas y Grupos */}
            <div className="perfil-card">
              <h2 className="perfil-card-title">Asignaturas y Grupos</h2>
              <ul>
                {asignaturas.length > 0 ? (
                  asignaturas.map((asignatura) => (
                    <li key={asignatura.asignatura}>
                      <strong>{asignatura.asignatura}:</strong> Grupo {asignatura.numgrupo}
                    </li>
                  ))
                ) : (
                  <p>No tienes asignaturas registradas.</p>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
