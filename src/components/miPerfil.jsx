import React, { useState , useEffect} from "react";
import "../styles/miPerfil-style.css";
import Footer from "./footer";
import Navbar from "./navbar";
import { useNavigate } from "react-router-dom";
import { obtenerDatosUsuario } from "../services/usuario";

export default function MiPerfil() {
    const [usuario, setUsuario] = useState(null);
      
    useEffect(() => {         // Llamada a la API sin cuerpoconst 
        const obtenerUsuario = async () => {             
        const response = await postAPI('/api/v1/usuario/obtenerDatosUsuario',);
        if (!response.err) {                 
        setUsuario(response.result); // Setear los datos del usuario            
        } else {                 
        console.error('Error al obtener los datos del usuario:', response.errmsg); } }; obtenerUsuario(); }, []); 
    return (
        <div className="page-container">
        <Navbar />
        <div className="content-wrap">
          <div className="perfil-container">
            <h1 className="perfil-title">Mi Perfil</h1>
            
            <div className="perfil-content">

ç
              <div className="perfil-card">
                <h2 className="perfil-card-title">Información Personal</h2>
                <p><strong>Nombre:</strong> {usuario.nombre_completo}</p>
                <p><strong>Correo:</strong> {usuario.usuario_correo}</p>
                <p><strong>Grado:</strong> {usuario.titulacion}</p>
              </div>
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