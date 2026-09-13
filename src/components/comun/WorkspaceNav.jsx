import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightArrowLeft, faHouse, faPlus, faListCheck, faUser, faLifeRing, faBell, faBars, faXmark, faArrowRightFromBracket, faChartSimple, faUsers, faLayerGroup, faFileSignature, faMessage } from '@fortawesome/free-solid-svg-icons';
import useNotificaciones from '../../hooks/useNotificaciones.js';
import NotificacionesLista from './NotificacionesLista.jsx';
import { logout } from '../../services/login.js';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import PropTypes from 'prop-types';

const menus = {
  estudiante: [
    ['workspace.home', '/estudiante', faHouse], ['workspace.request', '/solicitarPermuta', faPlus],
    ['workspace.proposals', '/permutas', faArrowRightArrowLeft], ['workspace.tracking', '/seguimiento', faListCheck],
    ['workspace.profile', '/miPerfil', faUser], ['workspace.support', '/misIncidencias', faLifeRing], ['navbar.feedback', '/feedback', faMessage],
  ],
  administrador: [
    ['workspace.home', '/admin', faHouse], ['navbar.new_incidents', '/incidenciasSinAsignar', faLifeRing],
    ['navbar.my_incidents', '/incidencias', faListCheck], ['navbar.user_management', '/gestionUsuarios', faUsers],
    ['navbar.group_management', '/gestionGrupos', faLayerGroup], ['navbar.view_stats', '/estadisticas', faChartSimple],
    ['navbar.create_notification', '/crearNotificacion', faBell], ['navbar.delegate_management', '/delegacion/certificados', faFileSignature],
    ['navbar.feedback_management', '/gestionFeedback', faMessage], ['workspace.settings', '/miPerfilAdmin', faUser], ['navbar.feedback', '/feedback', faMessage],
  ],
  delegacion: [['workspace.home', '/delegacion', faHouse], ['delegation.navbar.certificates', '/delegacion/certificados', faFileSignature], ['navbar.feedback', '/feedback', faMessage]],
};
export default function WorkspaceNav({ role }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [noticesOpen, setNoticesOpen] = useState(false);
  const centro = useNotificaciones();
  const dialog = useRef(null);
  const trigger = useRef(null);
  const menu = menus[role];
  useEffect(() => { setMenuOpen(false); setNoticesOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!noticesOpen) return;
    const previous = document.activeElement;
    dialog.current?.focus();
    const handler = e => {
      if (e.key === 'Escape') setNoticesOpen(false);
      if (e.key === 'Tab') {
        const nodes = dialog.current?.querySelectorAll('button:not([disabled]), select:not([disabled]), a[href], [tabindex="0"]');
        if (!nodes?.length) return;
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handler);
    return () => { document.removeEventListener('keydown', handler); previous?.focus(); };
  }, [noticesOpen]);
  const active = to => to === '/seguimiento' && ['/misPermutas', '/misSolicitudesPermuta', '/permutasAceptadas', '/generarPermuta'].includes(location.pathname);
  return <>
    <a href="#workspace-content" className="skip-content">{t('workspace.skip')}</a>
    <header className="workspace-topbar">
      <Link to={menu[0][1]} className="workspace-brand"><span className="brand-mark"><FontAwesomeIcon icon={faArrowRightArrowLeft} /></span><span>Permutas<span className="brand-school">ETSII · Universidad de Sevilla</span></span></Link>
      <div className="workspace-utilities"><span className="workspace-role">{t(`workspace.${role}`)}</span><LanguageSwitcher /><ThemeToggle />
        <button className="icon-button notification-bell" aria-label={t('common.notifications')} aria-describedby="notification-count" aria-haspopup="dialog" onClick={() => setNoticesOpen(true)}><FontAwesomeIcon icon={faBell} />{centro.noLeidas > 0 && <span className="notification-counter" aria-hidden="true">{centro.noLeidas > 99 ? '99+' : centro.noLeidas}</span>}<span id="notification-count" className="notification-sr-only">{t('notificationCenter.unreadCount', { count: centro.noLeidas })}</span></button>
        <button ref={trigger} className="icon-button mobile-menu-toggle" aria-label={t('workspace.menu')} aria-expanded={menuOpen} aria-controls="workspace-navigation" onClick={() => setMenuOpen(v => !v)}><FontAwesomeIcon icon={menuOpen ? faXmark : faBars} /></button>
      </div>
    </header>
    {menuOpen && <button className="workspace-backdrop" aria-label={t('common.close')} onClick={() => setMenuOpen(false)} />}
    <aside className={`workspace-rail ${menuOpen ? 'is-open' : ''}`} onKeyDown={e => { if (e.key === 'Escape') { setMenuOpen(false); trigger.current?.focus(); } }}>
      <p className="nav-section-label">{t('workspace.your_space')}</p>
      <nav id="workspace-navigation" aria-label={t('workspace.main_navigation')}>{menu.map(([key, to, icon]) => <NavLink key={to} to={to} end className={({ isActive }) => `workspace-nav-link ${isActive || active(to) ? 'selected' : ''}`}><FontAwesomeIcon icon={icon} /><span>{t(key)}</span></NavLink>)}</nav>
      <div className="workspace-rail-bottom"><p>{t('workspace.help_note')}</p><a href="mailto:delegacion_etsii@us.es">{t('footer.contact_us')}</a><button onClick={() => logout()}><FontAwesomeIcon icon={faArrowRightFromBracket} /> {t('navbar.logout')}</button></div>
    </aside>
    {role === 'estudiante' && <nav className="workspace-bottom-nav" aria-label={t('workspace.mobile_navigation')}>{menu.slice(0, 4).map(([key, to, icon]) => <NavLink key={to} to={to} className={({ isActive }) => isActive || active(to) ? 'selected' : ''}><FontAwesomeIcon icon={icon} /><span>{t(key)}</span></NavLink>)}</nav>}
    {noticesOpen && <div className="workspace-dialog-backdrop" onClick={e => { if (e.target === e.currentTarget) setNoticesOpen(false); }}><section className="workspace-notifications" role="dialog" aria-modal="true" aria-labelledby="notifications-heading" tabIndex={-1} ref={dialog}><div className="workspace-section-heading"><h2 id="notifications-heading">{t('common.notifications')}</h2><button className="icon-button" aria-label={t('common.close')} onClick={() => setNoticesOpen(false)}><FontAwesomeIcon icon={faXmark} /></button></div>
      <NotificacionesLista centro={centro} />
    </section></div>}
  </>;
}
WorkspaceNav.propTypes = { role: PropTypes.oneOf(['estudiante', 'administrador', 'delegacion']).isRequired };
