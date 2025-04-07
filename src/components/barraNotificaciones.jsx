import "../styles/barraNotificacion-style.css";

export default function BarraNotificacion({ notificaciones, cerrarSidebar }) {
    return (
        <div className="sidebar-rectangulo">
            <div className="sidebar">
                <button className="close-btn" onClick={cerrarSidebar}>X</button>
                <h2>Notificaciones</h2>
                <div className="notificaciones-list">
                    {notificaciones.map((notificacion) => (
                        <div className="notificacion-card" key={notificacion.id}>
                            <div className="notificacion-contenido">
                                <h3>{notificacion.contenido}</h3>
                                <p>{notificacion.fecha_creacion}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
