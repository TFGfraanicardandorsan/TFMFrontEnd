import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { actualizarFeedback, obtenerFeedback } from "../../services/feedback.js";
import {
    FEEDBACK_STATUSES,
    calculateFeedbackMetrics,
    feedbackCreatedAt,
    feedbackField,
    feedbackId,
    feedbackStatus,
    unwrapFeedbackList,
} from "../../lib/feedback.js";
import { buildFeedbackCsv } from "../../lib/feedbackCsv.js";
import { logError } from "../../lib/logger.js";
import { toCanonicalRole } from "../../lib/roles.js";
import "../../styles/admin-common.css";
import "../../styles/feedback-style.css";

const safeDate = (value, locale) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? String(value)
        : new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
};

export default function GestionFeedback() {
    const { t, i18n } = useTranslation();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("todos");
    const [roleFilter, setRoleFilter] = useState("todos");
    const [query, setQuery] = useState("");
    const [drafts, setDrafts] = useState({});
    const [savingId, setSavingId] = useState(null);

    useEffect(() => {
        const loadFeedback = async () => {
            try {
                const response = await obtenerFeedback();
                if (response?.err) throw new Error(response.errmsg);
                const result = unwrapFeedbackList(response);
                setItems(result);
                setDrafts(Object.fromEntries(result.map((item) => [
                    feedbackId(item),
                    {
                        estado: feedbackStatus(item),
                        respuesta: feedbackField(
                            item,
                            "respuesta_administracion",
                            "respuesta",
                            "adminResponse"
                        ),
                    },
                ])));
            } catch (loadError) {
                logError(loadError);
                setError(t("feedback.admin.load_error"));
            } finally {
                setLoading(false);
            }
        };

        loadFeedback();
    }, [t]);

    const filteredItems = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase(i18n.language);
        return items.filter((item) => {
            const statusMatches = statusFilter === "todos" || feedbackStatus(item) === statusFilter;
            const role = toCanonicalRole(feedbackField(item, "rol", "role"));
            const roleMatches = roleFilter === "todos" || role === roleFilter;
            const searchable = [
                feedbackField(item, "uvus", "usuario", "user"),
                feedbackField(item, "comentario", "sugerencia", "comment"),
                feedbackField(item, "tipo_aporte", "categoria", "category"),
            ].join(" ").toLocaleLowerCase(i18n.language);

            return statusMatches && roleMatches && (!normalizedQuery || searchable.includes(normalizedQuery));
        });
    }, [items, statusFilter, roleFilter, query, i18n.language]);

    const metrics = useMemo(() => calculateFeedbackMetrics(items), [items]);

    const updateDraft = (id, field, value) => {
        setDrafts((current) => ({
            ...current,
            [id]: {
                estado: current[id]?.estado || "recibida",
                respuesta: current[id]?.respuesta || "",
                [field]: value,
            },
        }));
    };

    const saveFeedback = async (item) => {
        const id = feedbackId(item);
        const draft = drafts[id] || { estado: feedbackStatus(item), respuesta: "" };
        setSavingId(id);
        try {
            const response = await actualizarFeedback(id, draft.estado, draft.respuesta.trim());
            if (response?.err) throw new Error(response.errmsg);
            setItems((current) => current.map((currentItem) =>
                feedbackId(currentItem) === id
                    ? {
                        ...currentItem,
                        estado: draft.estado,
                        respuesta_administracion: draft.respuesta.trim(),
                    }
                    : currentItem
            ));
            toast.success(t("feedback.admin.saved"));
        } catch (saveError) {
            logError(saveError);
            toast.error(t("feedback.admin.save_error"));
        } finally {
            setSavingId(null);
        }
    };

    const downloadCsv = () => {
        const csv = buildFeedbackCsv(filteredItems, t);
        const date = new Date().toISOString().slice(0, 10);
        saveAs(
            new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
            `feedback-permutas-${date}.csv`
        );
    };

    if (loading) return <div className="admin-loading">{t("feedback.admin.loading")}</div>;
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="admin-page-container feedback-admin-page">
            <div className="admin-content-wrap">
                <header className="admin-page-header feedback-admin-header">
                    <div>
                        <span className="feedback-kicker">{t("feedback.admin.kicker")}</span>
                        <h1 className="admin-page-title">{t("feedback.admin.title")}</h1>
                        <p className="admin-page-subtitle">{t("feedback.admin.subtitle")}</p>
                    </div>
                    <button
                        type="button"
                        className="admin-btn admin-btn-primary"
                        onClick={downloadCsv}
                        disabled={filteredItems.length === 0}
                    >
                        ↓ {t("feedback.admin.export")}
                    </button>
                </header>

                <section className="feedback-metrics" aria-label={t("feedback.admin.summary")}>
                    <article>
                        <span>{t("feedback.admin.total")}</span>
                        <strong>{metrics.total}</strong>
                    </article>
                    <article>
                        <span>{t("feedback.admin.average")}</span>
                        <strong>{metrics.averageSatisfaction === null ? "—" : `${metrics.averageSatisfaction.toFixed(1)}/5`}</strong>
                    </article>
                    <article>
                        <span>{t("feedback.admin.nps")}</span>
                        <strong>{metrics.nps === null ? "—" : metrics.nps}</strong>
                    </article>
                    <article>
                        <span>{t("feedback.admin.pending")}</span>
                        <strong>{metrics.pending}</strong>
                    </article>
                </section>

                <section className="feedback-admin-toolbar">
                    <label>
                        <span>{t("feedback.admin.search")}</span>
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={t("feedback.admin.search_placeholder")}
                        />
                    </label>
                    <label>
                        <span>{t("common.status")}</span>
                        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                            <option value="todos">{t("common.all")}</option>
                            {FEEDBACK_STATUSES.map((status) => (
                                <option value={status} key={status}>{t(`feedback.statuses.${status}`)}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <span>{t("common.role")}</span>
                        <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                            <option value="todos">{t("common.all_roles")}</option>
                            <option value="estudiante">{t("common.roles.estudiante")}</option>
                            <option value="administrador">{t("common.roles.administrador")}</option>
                            <option value="delegacion">{t("common.roles.delegacion")}</option>
                        </select>
                    </label>
                </section>

                {filteredItems.length === 0 ? (
                    <div className="admin-card admin-empty-state">
                        <div className="admin-empty-state-icon">💬</div>
                        <p className="admin-empty-state-text">{t("feedback.admin.empty")}</p>
                    </div>
                ) : (
                    <section className="feedback-admin-list">
                        {filteredItems.map((item) => {
                            const id = feedbackId(item);
                            const draft = drafts[id] || {
                                estado: feedbackStatus(item),
                                respuesta: "",
                            };
                            const category = feedbackField(item, "tipo_aporte", "categoria", "category");
                            return (
                                <article className="admin-card feedback-admin-item" key={id}>
                                    <div className="feedback-admin-item-header">
                                        <div>
                                            <span className={`feedback-status feedback-status-${feedbackStatus(item)}`}>
                                                {t(`feedback.statuses.${feedbackStatus(item)}`)}
                                            </span>
                                            <h2>
                                                {category
                                                    ? t(`feedback.categories.${category}`)
                                                    : t("feedback.admin.rating_only")}
                                            </h2>
                                            <p>
                                                {feedbackField(item, "uvus", "usuario", "user") || t("feedback.admin.unknown_user")}
                                                {" · "}
                                                {t(`common.roles.${feedbackField(item, "rol", "role")}`, {
                                                    defaultValue: feedbackField(item, "rol", "role") || "—",
                                                })}
                                                {" · "}
                                                {safeDate(feedbackCreatedAt(item), i18n.language)}
                                            </p>
                                        </div>
                                        <div className="feedback-admin-scores">
                                            <span>
                                                {t("feedback.admin.satisfaction")}
                                                <strong>{feedbackField(item, "satisfaccion_general", "satisfaccion", "satisfaction") || "—"}/5</strong>
                                            </span>
                                            <span>
                                                NPS
                                                <strong>{feedbackField(item, "recomendacion", "nps") ?? "—"}/10</strong>
                                            </span>
                                        </div>
                                    </div>

                                    <blockquote>
                                        {feedbackField(item, "comentario", "sugerencia", "comment") ||
                                            t("feedback.history.no_comment")}
                                    </blockquote>

                                    <div className="feedback-follow-up-form">
                                        <label>
                                            <span>{t("feedback.admin.new_status")}</span>
                                            <select
                                                value={draft.estado}
                                                onChange={(event) => updateDraft(id, "estado", event.target.value)}
                                            >
                                                {FEEDBACK_STATUSES.map((status) => (
                                                    <option value={status} key={status}>
                                                        {t(`feedback.statuses.${status}`)}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="feedback-response-field">
                                            <span>{t("feedback.admin.response")}</span>
                                            <textarea
                                                rows="3"
                                                maxLength="1500"
                                                value={draft.respuesta}
                                                onChange={(event) => updateDraft(id, "respuesta", event.target.value)}
                                                placeholder={t("feedback.admin.response_placeholder")}
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            className="admin-btn admin-btn-success"
                                            onClick={() => saveFeedback(item)}
                                            disabled={savingId === id}
                                        >
                                            {savingId === id ? t("common.processing") : t("common.save_changes")}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}
            </div>
        </div>
    );
}
