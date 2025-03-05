import React, { useState , useEffect} from "react";
import "../styles/miPerfil-style.css";
import Footer from "./footer";
import Navbar from "./navbar";
import { useNavigate } from "react-router-dom";
import { obtenerDatosUsuario } from "../services/usuario";

export default function MiPerfil() {
    const [issueType, setIssueType] = useState("");
    const [details, setDetails] = useState("");
    const [file, setFile] = useState(null);
    const [usuario, setUsuario] = useState("");
      
        useEffect(() => {
          obtenerDatosUsuario
            .then(response => response.json())
            .then(data => setUsuario(data))
            .catch(error => console.error("Error al obtener los datos del usuario:", error));
        }, []);
    return (
        <div className="page-container">
        <Navbar />
        <div className="content-wrap">
          <div className="perfil-container">
            <h1 className="perfil-title">Mi Perfil</h1>
            
            <div className="perfil-content">
              {/* Tarjeta de información personal */}
              {usuario && (
              <div className="perfil-card">
                <h2 className="perfil-card-title">Información Personal</h2>
                <p><strong>Nombre:</strong> {usuario.nombre_completo}</p>
                <p><strong>Correo:</strong> {usuario.usuario_correo}</p>
                <p><strong>Grado:</strong> {usuario.titulacion}</p>
              </div>
              )}
              {/* Tarjeta de asignaturas */}
              <div className="perfil-card">
                <h2 className="perfil-card-title">Asignaturas y Grupos</h2>
                <ul>
                  <li><strong>Matemáticas:</strong> Grupo 1</li>
                  <li><strong>Programación:</strong> Grupo 2</li>
                  <li><strong>Redes de Computadores:</strong> Grupo 3</li>
                  <li><strong>Base de Datos:</strong> Grupo 1</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
}