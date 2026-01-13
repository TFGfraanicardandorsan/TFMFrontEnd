import { useState, useEffect } from "react";
import "../../styles/navbar-style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { obtenerNotificaciones } from "../../services/notificacion.js";
import { logout } from "../../services/login.js";
import { formatearFecha } from "../../lib/formateadorFechas.js";
import { Link } from "react-router-dom";
import { logError } from "../../lib/logger.js";

export default function NavbarAdmin() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
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
          logError(data);
        }
      } catch (error) {
        logError(error);
      } finally {
        setCargando(false);
      }
    };
    cargarNotificaciones();
  }, []);

  const handleClickLogout = async () => {
    await logout();
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleLinkClick = (to) => {
    setOpen(false);
    if (to === "/logout") {
      handleClickLogout();
    } else {
      navigate(to);
    }
  };

  if (cargando) {
    return <div className="loading-text">Cargando...</div>;
  }
  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">Permutas ETSII - Admin</div>
        <button className="hamburger" onClick={() => setOpen(!open)}>
          ☰
        </button>
        <ul className={`nav-links-responsive ${open ? "open" : ""}`}>
          <li className="nav-group">
            <button
              className="nav-group-btn"
              onClick={() => setOpenGroup(openGroup === 0 ? null : 0)}
            >
              Gestión
            </button>
            <ul className={`nav-submenu ${openGroup === 0 ? "show" : ""}`}>
              <li>
                <button className="nav-link-btn" onClick={() => handleLinkClick("/")}>
                  Inicio
                </button>
              </li>
              <li>
                <button className="nav-link-btn" onClick={() => handleLinkClick("/incidenciasSinAsignar")}>
                  Incidencias
                </button>
              </li>
              <li>
                <button className="nav-link-btn" onClick={() => handleLinkClick("/incidencias")}>
                  Mis Incidencias
                </button>
              </li>
              <li>
                <button className="nav-link-btn" onClick={() => handleLinkClick("/crearNotificacion")}>
                  Crear notificación
                </button>
              </li>
              <li>
                <button className="nav-link-btn" onClick={() => handleLinkClick("/estadisticas")}>
                  Ver estadísticas
                </button>
              </li>
            </ul>
          </li>
          <li className="nav-group">
            <button
              className="nav-group-btn"
              onClick={() => setOpenGroup(openGroup === 1 ? null : 1)}
            >
              Perfil
            </button>
            <ul className={`nav-submenu ${openGroup === 1 ? "show" : ""}`}>
              <li>
                <button className="nav-link-btn" onClick={() => handleLinkClick("/miPerfilAdmin")}>
                  Mi perfil
                </button>
              </li>
              <li>
                <button className="nav-link-btn" onClick={() => handleLinkClick("/logout")}>
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </li>
        </ul>
        {/* Menú clásico para escritorio */}
        <ul className="nav-links">
          <li>
            <Link to="/">Inicio</Link>
          </li>
          <li>
            <Link to="/incidenciasSinAsignar">Incidencias</Link>
          </li>
          <li>
            <Link to="/incidencias">Mis Incidencias</Link>
          </li>
          <li>
            <Link to="/crearNotificacion">Crear notificación</Link>
          </li>
          <li>
            <Link to="/estadisticas">Ver estadísticas</Link>
          </li>
        </ul>
        <div className="nav-icons">
          <FontAwesomeIcon
            icon={faBell}
            className="icon bell-icon"
            onClick={toggleSidebar}
          />
          <FontAwesomeIcon
            icon={faUser}
            className="icon user"
            onClick={() => navigate("/miPerfilAdmin")}
          />
          <FontAwesomeIcon
            icon={faSignOutAlt}
            className="icon fa-sign-out-alt"
            onClick={handleClickLogout}
          />
        </div>
      </nav>
      {sidebarVisible && (
        <div className="sidebar">
          <h2>Notificaciones</h2>
          {notificaciones.length > 0 ? (
            notificaciones.slice(0, 5).map((notificacion) => (
              <div key={notificacion.id} className="notification-item">
                <p className="contenido">{notificacion.contenido}</p>
                <p className="fecha">
                  {formatearFecha(notificacion.fecha_creacion)}
                </p>
              </div>
            ))
          ) : (
            <p>No hay notificaciones</p>
          )}
        </div>
      )}
    </>
  );
}
