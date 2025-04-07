import { useState, useEffect } from "react";
import "../styles/navbar-style.css"; // Importa los estilos
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import {obtenerNotificaciones} from "../services/notificacion.js";

export default function Navbar() {

    const navigate = useNavigate();
    
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarNotificaciones = async () => {
            try {
                const data = await obtenerNotificaciones();
                if (Array.isArray(data.result.result)) {
                    setNotificaciones(data.result.result);
                } else {
                    console.error("La respuesta no es un arreglo", data);
                }
            } catch (error) {
                console.error("Error al obtener las notificaciones:", error);
            } finally {
                setCargando(false);
            }
        };
        cargarNotificaciones();
    }, []);
    const mostrarSidebar = () => {
        setSidebarVisible(true);
    };

    const cerrarSidebar = () => {
        setSidebarVisible(false);
    };

    if (cargando) {
        return <div className="loading-text">Cargando...</div>;
      }
    return (
                <nav className="navbar">
                    <ul className="nav-links">
                        <li><a href="/">Inicio</a></li>
                        <li><a href="#">Permutas</a></li>
                        <li><a href="#">Solicitar Permutas</a></li>
                        <li><a href="#">Mis Permutas</a></li>
                        <li><a href="/misIncidencias">Mis incidencias</a></li>
                    </ul>
                    <div className="nav-icons">
                        <FontAwesomeIcon icon={faBell} className="icon bell-icon" onClick={mostrarSidebar}/>
                        {sidebarVisible && (
                            <div className="sidebar">
                                <button className="close-btn" onClick={cerrarSidebar}>X</button>
                                <h2>Notificaciones</h2>
                                {notificaciones.length > 0 ? (
                                    notificaciones.map((notificacion, index) => (
                                        <div key={index} className="notification-item">
                                            <p>{notificacion.texto}</p>
                                            <p>{notificacion.fecha}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No hay notificaciones</p>
                                )}
                            </div>
                        )}
                        <FontAwesomeIcon icon={faUser} className="icon user" onClick={() => navigate("/miPerfil")}/>
                    </div>
                </nav>
    );
}
