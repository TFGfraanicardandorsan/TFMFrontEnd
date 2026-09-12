import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
const stages = [
  { routes: ['/miPerfil', '/seleccionarEstudios', '/seleccionarAsignaturas', '/seleccionarGrupos'], to: '/miPerfil', title: 'step1', help: 'step1_help' },
  { routes: ['/solicitarPermuta', '/misSolicitudesPermuta'], to: '/solicitarPermuta', title: 'step2', help: 'request_note' },
  { routes: ['/permutas', '/misPermutas'], to: '/permutas', title: 'step3', help: 'proposal_note' },
  { routes: ['/permutasAceptadas', '/generarPermuta'], to: '/permutasAceptadas', title: 'step4', help: 'document_note' },
];
export default function ProcessContext() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const current = stages.findIndex(s => s.routes.includes(pathname));
  if (current < 0) return null;
  return <section className="process-context" aria-label={t('workspace.guide')}>
    <div className="process-context-heading"><Link to="/seguimiento">← {t('workspace.back_tracking')}</Link><span>{t('workspace.stage')} {current + 1} / 4</span></div>
    <nav aria-label={t('workspace.process')}><ol className="process-steps">{stages.map((s, index) => <li key={s.to} className={current === index ? 'current' : ''}><Link to={s.to} aria-current={current === index ? 'step' : undefined}><span>{String(index + 1).padStart(2, '0')}</span>{t(`workspace.${s.title}`)}</Link></li>)}</ol></nav>
    <p>{t(`workspace.${stages[current].help}`)}</p>
  </section>;
}
