import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { obtenerSolicitudesPermuta, obtenerPermutasPropuestasSistema, obtenerPermutasAgrupadasPorUsuario, misPermutasPropuestas, misPermutasPropuestasPorMi } from '../../services/permuta.js';
import { agruparBloques, resultadoAPI } from '../../lib/bloquesPermuta.js';
import { translateRequestStatus, translateSwapStatus } from '../../lib/i18nLabels';
const sources = [obtenerSolicitudesPermuta, obtenerPermutasPropuestasSistema, obtenerPermutasAgrupadasPorUsuario, misPermutasPropuestas, misPermutasPropuestasPorMi];
export default function Seguimiento() {
  const { t } = useTranslation();
  const [data, setData] = useState([[], [], [], [], []]);
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('requests');
  const load = useCallback(async () => {
    setLoading(true);
    const responses = await Promise.allSettled(sources.map(fn => fn()));
    const failed = [];
    const lists = responses.map((r, index) => {
      try { if (r.status === 'rejected') throw r.reason; const list = resultadoAPI(r.value); if (!Array.isArray(list)) throw new Error(); return list; }
      catch { failed.push(index); return []; }
    });
    setData(lists); setFailures(failed); setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);
  // Proposal and request UUIDs belong to separate namespaces; never join them.
  const requests = agruparBloques(data[0]);
  const proposals = agruparBloques(data[1]).map(g => ({ ...g, to: '/permutas' }));
  const proposalIds = new Set(data[1].map(p => String(p.permuta_id)));
  const manual = [...new Map([...data[3], ...data[4]].filter(p => !proposalIds.has(String(p.permuta_id))).map(p => [String(p.permuta_id), p])).values()];
  const agreements = [...proposals, ...agruparBloques(manual).map(g => ({ ...g, key: `manual:${g.key}`, to: g.bloque ? '/permutas' : '/misPermutas' }))];
  const documents = data[2];
  const tabs = [{ key: 'requests', count: requests.length, to: '/misSolicitudesPermuta', failed: failures.includes(0) }, { key: 'agreements', count: agreements.length, to: '/misPermutas', failed: [1, 3, 4].some(i => failures.includes(i)) }, { key: 'documents', count: documents.length, to: '/permutasAceptadas', failed: failures.includes(2) }];
  const selected = tabs.find(x => x.key === tab);
  const rows = tab === 'requests' ? requests : tab === 'agreements' ? agreements : documents.map((d, i) => ({ key: i, miembros: d.permutas || [], to: '/permutasAceptadas' }));
  return <div className="workspace-page">
    <header className="workspace-page-heading"><div><p className="eyebrow">PERMUTAS / {t('workspace.tracking')}</p><h1>{t('workspace.tracking')}</h1><p>{t('workspace.tracking_intro')}</p></div><Link className="btn btn-primary" to="/solicitarPermuta">+ {t('workspace.new_request')}</Link></header>
    <div className="tracking-summary">{tabs.map((x, i) => <button key={x.key} className={tab === x.key ? 'active' : ''} onClick={() => setTab(x.key)} aria-pressed={tab === x.key}><span className="eyebrow">0{i + 1} / {t(`workspace.${x.key}`)}</span><strong>{loading || x.failed ? '—' : x.count}</strong><span>{t(`workspace.${x.key}_help`)}</span></button>)}</div>
    <section className="tracking-panel" aria-label={t(`workspace.${tab}`)} aria-busy={loading}>
      <div className="workspace-section-heading"><h2>{t(`workspace.${tab}`)}</h2><button className="btn btn-secondary" disabled={loading} onClick={load}>{t('workspace.refresh')}</button></div>
      {loading ? <p role="status">{t('common.loading')}</p> : <>
        {selected.failed && <p className="workspace-error" role="alert">{t('workspace.load_error')}</p>}
        {!selected.failed && !rows.length && <div className="workspace-empty"><span className="empty-symbol" aria-hidden="true">↔</span><h3>{t('workspace.empty')}</h3><p>{t(`workspace.${tab}_help`)}</p><Link className="btn btn-primary" to={tab === 'requests' ? '/solicitarPermuta' : selected.to}>{t(tab === 'requests' ? 'workspace.new_request' : `workspace.manage_${tab}`)}</Link></div>}
        <div className="tracking-list">{rows.map(g => <article key={g.key} className="tracking-row"><div>
          {g.bloque && <span className="workspace-badge">{t('workspace.block')}</span>}
          {g.miembros.map((m, i) => <div key={m.solicitud_id ?? m.permuta_id ?? i} className="tracking-subject"><h3>{m.nombre_asignatura || m.siglas_asignatura || m.codigo_asignatura}</h3><span className="workspace-status">{tab === 'requests' ? translateRequestStatus(t, m.estado) : translateSwapStatus(t, m.estado_permuta_asociada || m.estado)}</span></div>)}
          <p>{t(`workspace.${tab}_help`)}</p>
        </div><Link className="btn btn-secondary" to={g.to || selected.to}>{t(`workspace.manage_${tab}`)} →</Link></article>)}</div>
        <Link className="workspace-text-link" to={selected.to}>{t(`workspace.all_${tab}`)} →</Link>
      </>}
    </section>
  </div>;
}
