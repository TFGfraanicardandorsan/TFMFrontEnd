import React from "react";
import "../styles/navbar-style.css"; // Importa los estilos
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser } from '@fortawesome/free-solid-svg-icons';

export default function Navbar() {
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
                        <FontAwesomeIcon icon={faBell} className="icon bell-icon" />
                        <FontAwesomeIcon icon={faUser} className="icon user" />
                    </div>
                </nav>
    );
}
