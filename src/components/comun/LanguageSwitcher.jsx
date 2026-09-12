import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';
export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  return <label className="language-control"><span className="sr-only">{t('common.language.es')} / {t('common.language.en')} / {t('common.language.fr')}</span><select aria-label="Idioma / Language / Langue" value={(i18n.resolvedLanguage || 'es').split('-')[0]} onChange={e => i18n.changeLanguage(e.target.value)}><option value="es">ES</option><option value="en">EN</option><option value="fr">FR</option></select></label>;
}
