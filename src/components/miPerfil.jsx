import React, { useState, useEffect } from "react";
import "../styles/miPerfil-style.css";
import Footer from "./footer";
import Navbar from "./navbar";
import { obtenerDatosUsuario } from "../services/usuario"; // Importamos tu servicio

export default function MiPerfil() {
  const [usuario, setUsuario] = useState(null); // Estado para almacenar los datos del usuario

  useEffect(() => {
    const obtenerUsuario = async () => {
      // Llamamos al servicio para obtener los datos del usuario
      const response = await obtenerDatosUsuario();
      if (!response.err) {
        setUsuario(response.result.result); // Guardamos los datos del usuario en el estado
      } else {
        console.error('Error al obtener los datos del usuario:', response.errmsg);
      }
    };

    obtenerUsuario();
  }, []);  // Solo se ejecuta una vez cuando el componente se monta

  // Si el usuario aún no ha sido cargado, muestra un mensaje de carga
  if (!usuario) {
    return <div>Cargando...</div>;
  }
  // Si ya tenemos los datos del usuario, mostramos la información
  return (
    <div className="page-container">
      <Navbar />
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
                <li><strong>Matemática Discreta:</strong> Grupo 1</li>
                <li><strong>Fundamentos de Programación:</strong> Grupo 2</li>
                <li><strong>Redes de Computadores:</strong> Grupo 3</li>
                <li><strong>Base de Datos:</strong> Grupo 1</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}