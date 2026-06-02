import { useState } from "react";
import { crearNotificacion } from "../../services/notificacion";
import "../../styles/admin-common.css";
import "../../styles/crearNotificacion.css";
import { toast } from "react-toastify";
import { logError } from "../../lib/logger";
import { useTranslation } from "react-i18next";

export default function CrearNotificacion() {
    const { t } = useTranslation();
    const [contenido, setContenido] = useState("");
    const [receptor, setReceptor] = useState("");
    const [enviando, setEnviando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!contenido || !receptor) {
            toast.warning(t("admin.notifications.validation"));
            return;
        }

        setEnviando(true);
        try {
            await crearNotificacion(receptor, contenido);
            toast.success(t("admin.notifications.success"));
            setContenido("");
            setReceptor("");
        } catch (error) {
            toast.error(t("admin.notifications.error"));
            logError(error);
        } finally {
            setEnviando(false);
        }
    };

    // Información del receptor seleccionado
    const getReceptorInfo = () => {
        switch (receptor) {
            case "all":
                return { icon: "👥", label: t("common.roles_plural.all"), color: "primary" };
            case "estudiante":
                return { icon: "🎓", label: t("common.roles_plural.estudiante"), color: "secondary" };
            case "administrador":
                return { icon: "👔", label: t("common.roles_plural.administrador"), color: "warning" };
            case "delegacion":
                return { icon: "📄", label: t("common.roles_plural.delegacion"), color: "success" };
            default:
                return null;
        }
    };

    const receptorInfo = getReceptorInfo();

    return (
        <>
            <div className="admin-page-container">
                <div className="admin-content-wrap">
                    {/* Header */}
                    <div className="admin-page-header">
                        <h1 className="admin-page-title">{t("admin.notifications.title")}</h1>
                        <p className="admin-page-subtitle">
                            {t("admin.notifications.subtitle")}
                        </p>
                    </div>

                    {/* Formulario */}
                    <div className="admin-grid" style={{ maxWidth: "800px", margin: "0 auto" }}>
                        <div className="admin-card">
                            <div className="admin-card-header">
                                <h2 className="admin-card-title">
                                    <span className="admin-card-icon">✉️</span>
                                    {t("admin.notifications.new_title")}
                                </h2>
                                {receptorInfo && (
                                    <span className={`admin-badge admin-badge-${receptorInfo.color}`}>
                                        {receptorInfo.icon} {receptorInfo.label}
                                    </span>
                                )}
                            </div>
                            <div className="admin-card-body">
                                <form className="notificacion-form" onSubmit={handleSubmit}>
                                    <div className="admin-form-group">
                                        <label htmlFor="receptor" className="admin-label">
                                            {t("admin.notifications.recipients")}
                                        </label>
                                        <select
                                            id="receptor"
                                            className="admin-select"
                                            value={receptor}
                                            onChange={(e) => setReceptor(e.target.value)}
                                            required
                                        >
                                            <option value="">{t("admin.notifications.select_recipient")}</option>
                                            <option value="all">👥 {t("common.roles_plural.all")}</option>
                                            <option value="estudiante">🎓 {t("common.roles_plural.estudiante")}</option>
                                            <option value="administrador">👔 {t("common.roles_plural.administrador")}</option>
                                            <option value="delegacion">📄 {t("common.roles_plural.delegacion")}</option>
                                        </select>
                                    </div>

                                    <div className="admin-form-group">
                                        <label htmlFor="contenido" className="admin-label">
                                            {t("admin.notifications.content")}
                                        </label>
                                        <textarea
                                            id="contenido"
                                            className="admin-textarea"
                                            value={contenido}
                                            onChange={(e) => setContenido(e.target.value)}
                                            placeholder={t("admin.notifications.placeholder")}
                                            required
                                            rows={6}
                                        />
                                        <small style={{ color: "var(--admin-text-muted)", fontSize: "0.9rem" }}>
                                            {t("common.characters", { count: contenido.length })}
                                        </small>
                                    </div>

                                    <div className="admin-card-footer" style={{ marginTop: "var(--admin-spacing-lg)", paddingTop: 0, borderTop: "none" }}>
                                        <button
                                            type="button"
                                            className="admin-btn admin-btn-secondary"
                                            onClick={() => {
                                                setContenido("");
                                                setReceptor("");
                                            }}
                                            disabled={enviando}
                                        >
                                            🗑️ {t("common.clear")}
                                        </button>
                                        <button
                                            type="submit"
                                            className="admin-btn admin-btn-primary"
                                            disabled={enviando}
                                        >
                                            {enviando ? t("admin.notifications.sending") : t("admin.notifications.send")}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Card de Ayuda */}
                        <div className="admin-card admin-tips-card">
                            <div className="admin-card-body">
                                <h3 className="admin-tips-title">
                                    {t("admin.notifications.tips_title")}
                                </h3>
                                <ul className="admin-tips-list">
                                    {t("admin.notifications.tips", { returnObjects: true }).map((tip) => (
                                        <li key={tip}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
