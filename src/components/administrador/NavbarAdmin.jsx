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
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../comun/LanguageSwitcher";

const menu = [
  {
    label: "navbar.home",
    to: "/",
    icon: "🏠",
  },
  {
    label: "navbar.incidents",
    sub: [
      { to: "/incidenciasSinAsignar", label: "navbar.new_incidents", icon: "📋" },
      { to: "/incidencias", label: "navbar.my_incidents", icon: "🐛" },
    ],
  },
  {
    label: "navbar.create_notification",
    to: "/crearNotificacion",
    icon: "📢",
  },
  {
    label: "navbar.view_stats",
    to: "/estadisticas",
    icon: "📊",
  },
  {
    label: "navbar.management",
    sub: [
      { to: "/gestionUsuarios", label: "navbar.user_management", icon: "👥" },
      { to: "/gestionGrupos", label: "navbar.group_management", icon: "🔢" },
      { to: "/delegacion/certificados", label: "navbar.delegate_management", icon: "📄" },
      { to: "/gestionFeedback", label: "navbar.feedback_management", icon: "💬" },
    ],
  },
  {
    label: "navbar.feedback",
    to: "/feedback",
    icon: "✦",
  },
];

export default function NavbarAdmin() {
  const { t } = useTranslation();
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
    setOpenGroup(null);
    if (to === "/logout") {
      handleClickLogout();
    } else {
      navigate(to);
    }
  };

  if (cargando) {
    return <div className="loading-text">{t("common.loading")}</div>;
  }

  return (
    <>
      <nav className="navbar navbar-admin">
        <div className="navbar-brand">{t("navbar.brand")}</div>
        <button className="hamburger" onClick={() => setOpen(!open)}>
          ☰
        </button>

        {/* Overlay para cerrar menú al hacer click fuera */}
        <div className={`navbar-overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)}></div>

        <ul className={`nav-links-responsive ${open ? "open" : ""}`}>
          {menu.map((group, idx) => (
            <li key={group.label} className="nav-group">
              {group.to ? (
                <button
                  className="nav-group-btn nav-group-link-btn"
                  onClick={() => handleLinkClick(group.to)}
                >
                  <span className="nav-icon">{group.icon}</span>
                  {t(group.label)}
                </button>
              ) : (
                <>
                  <button
                    className="nav-group-btn"
                    onClick={() => setOpenGroup(openGroup === idx ? null : idx)}
                  >
                    {t(group.label)} {openGroup === idx ? "▲" : "▼"}
                  </button>
                  <ul className={`nav-submenu ${openGroup === idx ? "show" : ""}`}>
                    {group.sub.map((item) => (
                      <li key={item.to}>
                        <button className="nav-link-btn" onClick={() => handleLinkClick(item.to)}>
                          <span className="nav-icon">{item.icon}</span>
                          {t(item.label)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          ))}
          <li className="nav-group">
            <button
              className="nav-group-btn"
              onClick={() => setOpenGroup(openGroup === "profile" ? null : "profile")}
            >
              {t("navbar.profile")} {openGroup === "profile" ? "▲" : "▼"}
            </button>

            <ul className={`nav-submenu ${openGroup === "profile" ? "show" : ""}`}>
              <li>
                <button className="nav-link-btn" onClick={() => handleLinkClick("/miPerfilAdmin")}>
                  <span className="nav-icon">👤</span> {t("navbar.my_profile")}
                </button>
              </li>
              <li>
                <button className="nav-link-btn" onClick={() => handleLinkClick("/logout")}>
                  <span className="nav-icon">🚪</span> {t("navbar.logout")}
                </button>
              </li>
            </ul>

          </li>
        </ul>
        {/* Menú clásico para escritorio */}
        <ul className="nav-links">
          {menu.map((group) => (
            <li key={group.label} className={group.sub ? "dropdown" : ""}>
              {group.to ? (
                <Link to={group.to}>{t(group.label)}</Link>
              ) : (
                <>
                  <button className="dropdown-btn" type="button">
                    {t(group.label)} <span className="arrow">▼</span>
                  </button>
                  <ul className="dropdown-content">
                    {group.sub.map((item) => (
                      <li key={item.to}>
                        <Link to={item.to}>{t(item.label)}</Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          ))}
        </ul>

        <div className="nav-icons">
          <LanguageSwitcher />
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
      {/* Overlay para cerrar sidebar de notificaciones */}
      <div
        className={`sidebar-overlay ${sidebarVisible ? "open" : ""}`}
        onClick={() => setSidebarVisible(false)}
      />
      <div className={`sidebar ${sidebarVisible ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>{t("common.notifications")}</h2>
          <button className="sidebar-close-btn" onClick={() => setSidebarVisible(false)}>✕</button>
        </div>
        <div className="sidebar-content">
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
            <p>{t("common.no_notifications")}</p>
          )}
        </div>
      </div>
    </>
  );
}
