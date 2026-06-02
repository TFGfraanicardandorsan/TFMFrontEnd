import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/navbar-style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faFileSignature, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { obtenerNotificaciones } from "../../services/notificacion.js";
import { logout } from "../../services/login.js";
import { formatearFecha } from "../../lib/formateadorFechas.js";
import { logError } from "../../lib/logger.js";
import ThemeToggle from "../comun/ThemeToggle";
import LanguageSwitcher from "../comun/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const menu = [
  { to: "/delegacion", labelKey: "navbar.home", icon: "🏠" },
  { to: "/delegacion/certificados", labelKey: "delegation.navbar.certificates", icon: "📄" },
];

export default function NavbarDelegacion() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarNotificaciones = async () => {
      try {
        const data = await obtenerNotificaciones();
        if (Array.isArray(data.result?.result)) {
          setNotificaciones(data.result.result);
        } else {
          setNotificaciones([]);
        }
      } catch (error) {
        logError(error);
        setNotificaciones([]);
      } finally {
        setCargando(false);
      }
    };

    cargarNotificaciones();
  }, []);

  const handleClickLogout = async () => {
    await logout();
  };

  const handleLinkClick = (to) => {
    setOpen(false);
    navigate(to);
  };

  if (cargando) {
    return <div className="loading-text">{t("common.loading")}</div>;
  }

  return (
    <>
      <nav className="navbar navbar-delegacion">
        <div className="navbar-brand">{t("delegation.navbar.brand")}</div>
        <button className="hamburger" onClick={() => setOpen(!open)} aria-label={t("delegation.navbar.open_menu")}>
          ☰
        </button>

        <div className={`navbar-overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)} />

        <ul className={`nav-links-responsive ${open ? "open" : ""}`}>
          {menu.map((item) => (
            <li key={item.to} className="nav-group">
              <button className="nav-group-btn" onClick={() => handleLinkClick(item.to)}>
                <span className="nav-icon">{item.icon}</span> {t(item.labelKey)}
              </button>
            </li>
          ))}
          <li className="nav-group">
            <button className="nav-group-btn" onClick={handleClickLogout}>
              <span className="nav-icon">🚪</span> {t("navbar.logout")}
            </button>
          </li>
        </ul>

        <ul className="nav-links">
          {menu.map((item) => (
            <li key={item.to}>
              <Link to={item.to}>{t(item.labelKey)}</Link>
            </li>
          ))}
        </ul>

        <div className="nav-icons">
          <LanguageSwitcher />
          <ThemeToggle />
          <FontAwesomeIcon
            icon={faBell}
            className="icon bell-icon"
            onClick={() => setSidebarVisible(true)}
          />
          <FontAwesomeIcon
            icon={faFileSignature}
            className="icon user"
            onClick={() => navigate("/delegacion/certificados")}
          />
          <FontAwesomeIcon
            icon={faSignOutAlt}
            className="icon fa-sign-out-alt"
            onClick={handleClickLogout}
          />
        </div>
      </nav>

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
                <p className="fecha">{formatearFecha(notificacion.fecha_creacion)}</p>
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
