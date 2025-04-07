import { useState } from "react";
import "../styles/barraNotificacion-style.css"; // Asegúrate de tener un archivo CSS con los estilos para la barra lateral

export default function barraNotificacion({ notificaciones, cerrarSidebar }) {
    return (
        <div className="sidebar">
            <button className="close-btn" onClick={cerrarSidebar}>X</button>
            <h2>Notificaciones</h2>
            <div className="notificaciones-list">
                {notificaciones.map((notificacion) => (
                    <div className="notificacion-card" key={notificacion.id}>
                        <div className="notificacion-contenido">
                            <h3>{notificacion.contenido}</h3>
                            <p>{notificacion.fecha}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
