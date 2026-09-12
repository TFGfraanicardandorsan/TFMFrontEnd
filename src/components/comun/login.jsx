import Footer from './footer';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
export default function Login() {
  const { t } = useTranslation();
  return <div className="public-workspace"><header className="public-topbar"><a href="/login" className="workspace-brand"><span className="brand-mark">↔</span>Permutas ETSII</a><LanguageSwitcher /></header><main className="login-workspace"><section className="login-introduction"><p className="eyebrow">UNIVERSIDAD DE SEVILLA / ETSII</p><h1>{t('workspace.welcome')}</h1><p>{t('workspace.intro')}</p><ol>{[1,2,3,4].map(i => <li key={i}><span>0{i}</span><div><strong>{t(`workspace.step${i}`)}</strong><p>{t(`workspace.step${i}_help`)}</p></div></li>)}</ol></section><section className="login-access"><img src="/assets/logo-etsii-color.png" alt={t('common.logo_alt')} /><h2>{t('login.title')}</h2><button className="login-submit" onClick={() => { window.location.href = 'https://permutas.eii.us.es/api/v1/autorizacion/saml/login'; }}>{t('login.button')} →</button><div className="login-community"><p>{t('login.telegram_info')}</p><img src="/assets/telegram-qr.png" alt={t('registration.telegram_alt')} /></div></section></main><Footer /></div>;
}
