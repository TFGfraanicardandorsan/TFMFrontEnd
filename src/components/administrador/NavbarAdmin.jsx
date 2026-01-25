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
import ThemeToggle from "../comun/ThemeToggle";

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
      <nav className="navbar navbar-admin">
        <div className="navbar-brand">Permutas ETSII - Admin</div>
        <button className="hamburger" onClick={() => setOpen(!open)}>
          ☰
        </button>

        {/* Overlay para cerrar menú al hacer click fuera */}
        <div className={`navbar-overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)}></div>

        <ul className={`nav-links-responsive ${open ? "open" : ""}`}>
          <li className="nav-group">
            <button
              className="nav-group-btn"
              onClick={() => setOpenGroup(openGroup === 0 ? null : 0)}
            >
              Gestión {openGroup === 0 ? "▲" : "▼"}
            </button>
            <ul className={`nav-submenu ${openGroup === 0 ? "show" : ""}`}>
              <li>
                <button className="nav-link-btn" onClick={() => handleLinkClick("/")}>
                  <span className="nav-icon">🏠</span> Inicio
                </button>
              </li>
              <li>
                <button className="nav-link-btn" onClick={() => handleLinkClick("/incidenciasSinAsignar")}>
                  <span className="nav-icon">📋</span> Incidencias
                </button>
              </li>
              <li>
                <button className="nav-link-btn" onClick={() => handleLinkClick("/incidencias")}>
                  <span className="nav-icon">🐛</span> Mis Incidencias
                </button>
              </li>
              <li>
                <button className="nav-link-btn" onClick={() => handleLinkClick("/crearNotificacion")}>
                  <span className="nav-icon">📢</span> Crear notificación
                </button>
              </li>
              <li>
                <button className="nav-link-btn" onClick={() => handleLinkClick("/estadisticas")}>
                  <span className="nav-icon">📊</span> Ver estadísticas
                </button>
              </li>
              <li>
                <button className="nav-link-btn" onClick={() => handleLinkClick("/gestionUsuarios")}>
                  <span className="nav-icon">👥</span> Gestión de usuarios
                </button>
              </li>
            </ul>
          </li>
          <li className="nav-group">
            <button
              className="nav-group-btn"
              onClick={() => setOpenGroup(openGroup === 1 ? null : 1)}
            >
              Perfil {openGroup === 1 ? "▲" : "▼"}
            </button>
            <ul className={`nav-submenu ${openGroup === 1 ? "show" : ""}`}>
              <li>
                <button className="nav-link-btn" onClick={() => handleLinkClick("/miPerfilAdmin")}>
                  <span className="nav-icon">👤</span> Mi perfil
                </button>
              </li>
              <li>
                <button className="nav-link-btn" onClick={() => handleLinkClick("/logout")}>
                  <span className="nav-icon">🚪</span> Cerrar sesión
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
          <li>
            <Link to="/gestionUsuarios">Gestión de usuarios</Link>
          </li>
        </ul>
        <div className="nav-icons">
          <ThemeToggle />
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
