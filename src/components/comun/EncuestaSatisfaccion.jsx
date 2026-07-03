import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { crearFeedback, obtenerMiFeedback } from "../../services/feedback.js";
import {
    FEEDBACK_CATEGORIES,
    feedbackCreatedAt,
    feedbackField,
    feedbackId,
    feedbackStatus,
    unwrapFeedbackList,
} from "../../lib/feedback.js";
import { logError } from "../../lib/logger.js";
import "../../styles/feedback-style.css";

const initialForm = {
    satisfaccion_general: 0,
    facilidad_uso: 0,
    recomendacion: null,
    tipo_aporte: "",
    comentario: "",
    solicita_seguimiento: true,
};

const formatDate = (value, locale) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? String(value)
        : new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
};

function RatingButtons({ value, onChange, max, label, lowLabel, highLabel }) {
    return (
        <fieldset className="feedback-fieldset">
            <legend>{label}</legend>
            <div className="feedback-rating" role="radiogroup" aria-label={label}>
                {Array.from({ length: max + 1 }, (_, index) => index + (max === 5 ? 1 : 0))
                    .slice(0, max === 5 ? 5 : 11)
                    .map((rating) => (
                        <button
                            key={rating}
                            type="button"
                            className={`feedback-rating-button ${Number(value) === rating ? "is-selected" : ""}`}
                            onClick={() => onChange(rating)}
                            role="radio"
                            aria-checked={Number(value) === rating}
                        >
                            {rating}
                        </button>
                    ))}
            </div>
            <div className="feedback-rating-labels" aria-hidden="true">
                <span>{lowLabel}</span>
                <span>{highLabel}</span>
            </div>
        </fieldset>
    );
}

RatingButtons.propTypes = {
    value: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    max: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    lowLabel: PropTypes.string.isRequired,
    highLabel: PropTypes.string.isRequired,
};

export default function EncuestaSatisfaccion() {
    const { t, i18n } = useTranslation();
    const [form, setForm] = useState(initialForm);
    const [myFeedback, setMyFeedback] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const loadHistory = useCallback(async () => {
        setLoadingHistory(true);
        try {
            const response = await obtenerMiFeedback();
            if (response?.err) throw new Error(response.errmsg);
            setMyFeedback(unwrapFeedbackList(response));
        } catch (error) {
            logError(error);
        } finally {
            setLoadingHistory(false);
        }
    }, []);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const updateForm = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!form.satisfaccion_general || !form.facilidad_uso || form.recomendacion === null) {
            toast.error(t("feedback.form.required_ratings"));
            return;
        }

        setSubmitting(true);
        try {
            const response = await crearFeedback({
                ...form,
                comentario: form.comentario.trim(),
            });
            if (response?.err) throw new Error(response.errmsg);
            toast.success(t("feedback.form.success"));
            setForm(initialForm);
            await loadHistory();
        } catch (error) {
            logError(error);
            toast.error(t("feedback.form.error"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="feedback-page">
            <div className="feedback-shell">
                <header className="feedback-hero">
                    <span className="feedback-kicker">{t("feedback.kicker")}</span>
                    <h1>{t("feedback.title")}</h1>
                    <p>{t("feedback.subtitle")}</p>
                </header>

                <div className="feedback-layout">
                    <form className="feedback-card feedback-form" onSubmit={handleSubmit}>
                        <div className="feedback-card-heading">
                            <div>
                                <span className="feedback-step">1</span>
                                <h2>{t("feedback.form.title")}</h2>
                            </div>
                            <span className="feedback-time">{t("feedback.form.time")}</span>
                        </div>

                        <RatingButtons
                            value={form.satisfaccion_general}
                            onChange={(value) => updateForm("satisfaccion_general", value)}
                            max={5}
                            label={t("feedback.form.satisfaction")}
                            lowLabel={t("feedback.form.very_dissatisfied")}
                            highLabel={t("feedback.form.very_satisfied")}
                        />

                        <RatingButtons
                            value={form.facilidad_uso}
                            onChange={(value) => updateForm("facilidad_uso", value)}
                            max={5}
                            label={t("feedback.form.ease")}
                            lowLabel={t("feedback.form.very_difficult")}
                            highLabel={t("feedback.form.very_easy")}
                        />

                        <RatingButtons
                            value={form.recomendacion}
                            onChange={(value) => updateForm("recomendacion", value)}
                            max={10}
                            label={t("feedback.form.recommendation")}
                            lowLabel={t("feedback.form.not_likely")}
                            highLabel={t("feedback.form.very_likely")}
                        />

                        <div className="feedback-field">
                            <label htmlFor="feedback-category">{t("feedback.form.category")}</label>
                            <select
                                id="feedback-category"
                                value={form.tipo_aporte}
                                onChange={(event) => updateForm("tipo_aporte", event.target.value)}
                            >
                                <option value="">{t("feedback.form.category_placeholder")}</option>
                                {FEEDBACK_CATEGORIES.map((category) => (
                                    <option value={category} key={category}>
                                        {t(`feedback.categories.${category}`)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="feedback-field">
                            <div className="feedback-label-row">
                                <label htmlFor="feedback-comment">{t("feedback.form.comment")}</label>
                                <span>{t("common.optional")}</span>
                            </div>
                            <textarea
                                id="feedback-comment"
                                rows="5"
                                maxLength="1500"
                                value={form.comentario}
                                onChange={(event) => updateForm("comentario", event.target.value)}
                                placeholder={t("feedback.form.comment_placeholder")}
                            />
                            <small>{t("common.characters", { count: form.comentario.length })} / 1500</small>
                        </div>

                        <label className="feedback-checkbox">
                            <input
                                type="checkbox"
                                checked={form.solicita_seguimiento}
                                onChange={(event) => updateForm("solicita_seguimiento", event.target.checked)}
                            />
                            <span>
                                <strong>{t("feedback.form.follow_up")}</strong>
                                {t("feedback.form.follow_up_hint")}
                            </span>
                        </label>

                        <p className="feedback-privacy">{t("feedback.form.privacy")}</p>

                        <button className="feedback-primary-button" type="submit" disabled={submitting}>
                            {submitting ? t("common.processing") : t("feedback.form.submit")}
                        </button>
                    </form>

                    <aside className="feedback-card feedback-history">
                        <div className="feedback-card-heading">
                            <div>
                                <span className="feedback-step">2</span>
                                <h2>{t("feedback.history.title")}</h2>
                            </div>
                        </div>
                        <p className="feedback-history-intro">{t("feedback.history.subtitle")}</p>

                        {loadingHistory ? (
                            <p className="feedback-empty">{t("common.loading")}</p>
                        ) : myFeedback.length === 0 ? (
                            <div className="feedback-empty">
                                <span>💬</span>
                                <p>{t("feedback.history.empty")}</p>
                            </div>
                        ) : (
                            <div className="feedback-history-list">
                                {myFeedback.map((item) => {
                                    const status = feedbackStatus(item);
                                    const adminResponse = feedbackField(
                                        item,
                                        "respuesta_administracion",
                                        "respuesta",
                                        "adminResponse"
                                    );
                                    return (
                                        <article className="feedback-history-item" key={feedbackId(item)}>
                                            <div className="feedback-history-meta">
                                                <span className={`feedback-status feedback-status-${status}`}>
                                                    {t(`feedback.statuses.${status}`)}
                                                </span>
                                                <time>{formatDate(feedbackCreatedAt(item), i18n.language)}</time>
                                            </div>
                                            <strong>
                                                {t("feedback.history.rating", {
                                                    value: feedbackField(item, "satisfaccion_general", "satisfaccion", "satisfaction"),
                                                })}
                                            </strong>
                                            <p>
                                                {feedbackField(item, "comentario", "sugerencia", "comment") ||
                                                    t("feedback.history.no_comment")}
                                            </p>
                                            {adminResponse && (
                                                <div className="feedback-admin-reply">
                                                    <span>{t("feedback.history.admin_response")}</span>
                                                    <p>{adminResponse}</p>
                                                </div>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}
