import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Footer from '../components/comun/footer';
import NavbarEstudiante from '../components/usuario/NavbarEstudiante';
import { comprobarAsignaturasSinGrupo } from '../services/asignaturas';
import ProcessContext from '../components/usuario/ProcessContext';

export default function LayoutEstudiante() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [incomplete, setIncomplete] = useState(false);
  useEffect(() => {
    let alive = true;
    comprobarAsignaturasSinGrupo().then(res => {
      const data = res?.result;
      if (alive && !res?.err) setIncomplete(data === true || data?.result === true || data?.result?.result === true);
    }).catch(() => {});
    return () => { alive = false; };
  }, [pathname]);
  return <div className="app-frame">
    <NavbarEstudiante />
    <main id="workspace-content" tabIndex={-1} className="workspace-main">
      {incomplete && !['/seleccionarGrupos', '/seleccionarAsignaturas'].includes(pathname) && <div className="workspace-setup-note" role="status"><span>{t('workspace.setup_note')}</span><Link to="/seleccionarGrupos">{t('workspace.setup_action')} →</Link></div>}
      <ProcessContext />
      <Outlet />
    </main>
    <Footer />
  </div>;
}
