import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { obtenerNotificaciones } from '../../services/notificacion.js';
import { formatearFecha } from '../../lib/formateadorFechas.js';
import { useAuth } from '../../hooks/useAuth';
import { ADMIN_ROLE, isAllowedRole } from '../../lib/roles';
export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const admin = isAllowedRole(user?.rol, [ADMIN_ROLE]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    obtenerNotificaciones().then(r => {
      if (r?.err || r?.result?.err || !Array.isArray(r?.result?.result)) throw new Error();
      if (alive) setNotices(r.result.result);
    }).catch(() => { if (alive) setError(true); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);
  const routes = admin ? ['/incidenciasSinAsignar', '/gestionUsuarios', '/gestionGrupos', '/estadisticas'] : ['/miPerfil', '/solicitarPermuta', '/permutas', '/permutasAceptadas'];
  const adminKeys = ['navbar.new_incidents', 'navbar.user_management', 'navbar.group_management', 'navbar.view_stats'];
  return <div className="workspace-page home-workspace">
    <section className="welcome-panel">
      <div className="welcome-copy"><p className="eyebrow">ETSII / {t(`workspace.${admin ? 'administrador' : 'estudiante'}`)}</p><h1>{t(`workspace.${admin ? 'admin_title' : 'welcome'}`)}</h1><p>{t(`workspace.${admin ? 'admin_intro' : 'intro'}`)}</p>
      <div className="welcome-actions"><Link className="btn btn-primary" to={admin ? '/incidenciasSinAsignar' : '/solicitarPermuta'}>{t(admin ? 'navbar.new_incidents' : 'workspace.new_request')} <span aria-hidden="true">↗</span></Link><Link className="btn btn-secondary" to={admin ? '/estadisticas' : '/seguimiento'}>{t(admin ? 'navbar.view_stats' : 'workspace.view_tracking')} →</Link></div></div>
      <div className="welcome-art" aria-hidden="true"><div className="art-grid" /><span className="art-label">CAMPUS / ETSII</span><div className="exchange-glyph">↔</div><div className="art-caption">{t('workspace.art_caption')}</div><span className="art-corner">01 — 04</span></div>
    </section>
    <section className="home-process"><div className="workspace-section-heading"><h2>{t(admin ? 'workspace.quick_access' : 'workspace.process')}</h2><span className="eyebrow">{admin ? 'ETSII' : '01 — 04'}</span></div><div className="home-step-grid">{routes.map((route, i) => <Link className="home-step" to={route} key={route}><span className="step-number">0{i + 1}</span><h3>{t(admin ? adminKeys[i] : `workspace.step${i + 1}`)}</h3>{!admin && <p>{t(`workspace.step${i + 1}_help`)}</p>}<span className="step-arrow" aria-hidden="true">↗</span></Link>)}</div></section>
    <section className="home-announcements"><div className="workspace-section-heading"><h2>{t('workspace.announcements')}</h2><span className="workspace-badge">ETSII</span></div>{loading ? <p role="status">{t('common.loading')}</p> : error ? <p role="alert">{t('workspace.load_error')}</p> : notices.length ? notices.slice(0, 9).map(n => <article key={n.id} className="home-announcement"><time>{formatearFecha(n.fecha_creacion)}</time><p>{n.contenido}</p></article>) : <p>{t('workspace.no_notices')}</p>}</section>
  </div>;
}
