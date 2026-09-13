import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { formatearFecha } from '../../lib/formateadorFechas.js';
import '../../styles/notificationCenter.css';

const tipos = ['ADMINISTRACION', 'PERMUTA', 'DOCUMENTO', 'INCIDENCIA'];
const enlaces = new Set(['/seguimiento', '/permutasAceptadas', '/misIncidencias']);

export default function NotificacionesLista({ centro, limiteInicial = 20 }) {
  const { t } = useTranslation();
  const filtroId = useId();
  const [tipo, setTipo] = useState('TODAS');
  const [limite, setLimite] = useState(limiteInicial);
  const { notices, loading, error, errorLectura, guardando, recargar, cambiarLectura, marcarTodas, noLeidas } = centro;
  const filtradas = notices.filter(n => tipo === 'TODAS' || (n.tipo || 'ADMINISTRACION') === tipo);

  return <div className="notification-center">
    <div className="notification-toolbar">
      <label htmlFor={filtroId}>{t('notificationCenter.category')}</label>
      <select id={filtroId} value={tipo} onChange={e => { setTipo(e.target.value); setLimite(limiteInicial); }}>
        <option value="TODAS">{t('notificationCenter.all')}</option>
        {tipos.map(valor => <option key={valor} value={valor}>{t(`notificationCenter.types.${valor}`)}</option>)}
      </select>
      <button type="button" className="btn btn-secondary" disabled={guardando || !noLeidas || loading} onClick={marcarTodas}>{t('notificationCenter.markAll')}</button>
    </div>
    <p className="notification-summary" role="status">{t('notificationCenter.unreadCount', { count: noLeidas })}</p>
    {loading && <p role="status">{t('common.loading')}</p>}
    {error && <p role="alert">{t('workspace.load_error')} <button type="button" onClick={recargar}>{t('notificationCenter.retry')}</button></p>}
    {errorLectura && <p role="alert">{t('notificationCenter.saveError')}</p>}
    {!loading && !error && !filtradas.length && <p>{t('common.no_notifications')}</p>}
    {filtradas.slice(0, limite).map(n => <article key={n.id} className={`notification-item ${n.leida ? 'is-read' : 'is-unread'}`}>
      <div className="notification-meta"><span>{t(`notificationCenter.types.${tipos.includes(n.tipo) ? n.tipo : 'ADMINISTRACION'}`)}</span>
        <span className="notification-reading-state">{t(n.leida ? 'notificationCenter.read' : 'notificationCenter.unread')}</span></div>
      <p>{n.contenido}</p>
      <time dateTime={n.fecha_creacion}>{formatearFecha(n.fecha_creacion)}</time>
      <div className="notification-actions">
        {enlaces.has(n.enlace) && <Link to={n.enlace}>{t('notificationCenter.view')}</Link>}
        <button type="button" disabled={guardando} onClick={() => cambiarLectura(n.id, !n.leida)}>{t(n.leida ? 'notificationCenter.markUnread' : 'notificationCenter.markRead')}</button>
      </div>
    </article>)}
    {filtradas.length > limite && <button type="button" className="btn btn-secondary" onClick={() => setLimite(v => v + 20)}>{t('notificationCenter.more')}</button>}
  </div>;
}

NotificacionesLista.propTypes = { centro: PropTypes.object.isRequired, limiteInicial: PropTypes.number };
