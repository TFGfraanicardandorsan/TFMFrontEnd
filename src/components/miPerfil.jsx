import React, { useEffect, useState } from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import "../styles/perfil.css"; // Archivo CSS para los estilos del perfil

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await fetch("api/v1/usuario/obtenerDatosUsuario", {
          credentials: "include" // Permite que se envíen cookies con la petición
        });

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        setUsuario(data);
      } catch (err) {
        console.error("Error al obtener los datos del usuario:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, []);

  return (
    <div className="page-container">
      <Navbar />
      <div className="content-wrap">
        <div className="perfil-container">
          <h1 className="perfil-title">Mi Perfil</h1>

          {loading ? (
            <p className="loading-message">Cargando datos del usuario...</p>
          ) : error ? (
            <p className="error-message">Error: {error}</p>
          ) : (
            <div className="perfil-content">
              {/* Tarjeta de información personal */}
              <div className="perfil-card">
                <h2 className="perfil-card-title">Información Personal</h2>
                <p><strong>Nombre:</strong> {usuario?.nombre || "Desconocido"}</p>
                <p><strong>Correo:</strong> {usuario?.correo || "Desconocido"}</p>
                <p><strong>Grado:</strong> {usuario?.titulacion || "Desconocido"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Perfil;
