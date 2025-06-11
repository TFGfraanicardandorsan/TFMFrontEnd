import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar-style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { obtenerNotificaciones } from "../services/notificacion.js";
import { logout } from "../services/login.js";
import { formatearFecha } from "../lib/formateadorFechas.js";
import { logError } from "../lib/logger.js";

const menu = [
  {
    label: "Permutas",
    sub: [
      { to: "/permutas", label: "Ver permutas" },
      { to: "/misPermutas", label: "Mis permutas" },
      { to: "/solicitarPermuta", label: "Solicitar permuta" },
      { to: "/misSolicitudesPermuta", label: "Mis solicitudes" },
      { to: "/permutasAceptadas", label: "Permutas aceptadas" },
    ],
  },
  {
    label: "Incidencias",
    sub: [
      { to: "/misIncidencias", label: "Mis incidencias" },
      { to: "/reportarIncidencia", label: "Reportar incidencia" },
    ],
  },
  {
    label: "Perfil",
    sub: [
      { to: "/miPerfil", label: "Mi perfil" },
      { to: "/logout", label: "Cerrar sesión" },
    ],
  },
];

export default function NavbarEstudiante() {
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

  // Cierra el menú al navegar
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
        <div className="navbar-brand">Permutas ETSII</div>
        <button className="hamburger" onClick={() => setOpen(!open)}>
          ☰
        </button>
        <ul className={`nav-links-responsive ${open ? "open" : ""}`}>
          {menu.map((group, idx) => (
            <li key={group.label} className="nav-group">
              <button
                className="nav-group-btn"
                onClick={() => setOpenGroup(openGroup === idx ? null : idx)}
              >
                {group.label}
              </button>
              <ul className={`nav-submenu ${openGroup === idx ? "show" : ""}`}>
                {group.sub.map((item) => (
                  <li key={item.to}>
                    <button
                      className="nav-link-btn"
                      onClick={() => handleLinkClick(item.to)}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        {/* Menú clásico para escritorio */}
        <ul className="nav-links">
          <li>
            <Link to= "/">Inicio</Link>
          </li>
          <li>
            <Link to="/permutas">Permutas</Link>
          </li>
          <li>
            <Link to="/misPermutas">Mis Permutas</Link>
          </li>
          <li>
            <Link to="/solicitarPermuta">Solicitar Permutas</Link>
          </li>
          <li>
            <Link to="/misSolicitudesPermuta">Mis Solicitudes</Link>
          </li>
          <li>
            <Link to="/permutasAceptadas">Permutas Aceptadas</Link>
          </li>
          <li>
            <Link to="/misIncidencias">Mis incidencias</Link>
          </li>
          <li>
            <Link to="/reportarIncidencia">Reportar incidencia</Link>
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
            onClick={() => navigate("/miPerfil")}
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
