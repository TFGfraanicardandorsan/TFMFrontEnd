import React from "react";
import "../styles/navbar-style.css"; // Importa los estilos
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();

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
                        <FontAwesomeIcon icon={faBell} className="icon bell-icon"/>
                        <FontAwesomeIcon icon={faUser} className="icon user" onClick={() => navigate("/miPerfil")}/>
                    </div>
                </nav>
    );
}
