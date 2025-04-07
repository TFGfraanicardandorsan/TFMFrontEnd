import React from "react";
import "../styles/navbar-style.css"; // Importa los estilos
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";

export default function Navbar() {

    const navigate = useNavigate();
    
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);

    useEffect(() => {
        const cargarNotificaciones = async () => {
            try {
                const data = await obtenerNotificaciones();
                console.log(data);
                // Asegúrate de que data es un arreglo
                if (Array.isArray(data.result.result)) {
                    setNotificaciones(data.result.result);
                } else {
                    console.error("La respuesta no es un arreglo", data);
                    setNotificaciones([]); // Si no es un arreglo, se puede establecer un arreglo vacío
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
                        <FontAwesomeIcon icon={faBell} className="icon bell-icon"/>{sidebarVisible && <Sidebar notificaciones={fakeNotificaciones} cerrarSidebar={cerrarSidebar} />}
                        <FontAwesomeIcon icon={faUser} className="icon user" onClick={() => navigate("/miPerfil")}/>
                    </div>
                </nav>
    );
}
