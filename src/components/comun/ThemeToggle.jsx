import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

export default function ThemeToggle() {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={theme === 'light' ? t("common.theme_toggle.dark") : t("common.theme_toggle.light")}
            aria-label={t("common.theme_toggle.label")}
        >
            <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
        </button>
    );
}
