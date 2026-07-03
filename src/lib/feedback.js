export const FEEDBACK_STATUSES = [
    "recibida",
    "en_revision",
    "planificada",
    "implementada",
    "descartada",
];

export const FEEDBACK_CATEGORIES = [
    "mejora",
    "problema",
    "nueva_funcionalidad",
    "otro",
];

export const unwrapFeedbackList = (response) => {
    const candidate =
        response?.result?.result ??
        response?.result?.data ??
        response?.result ??
        response?.data ??
        response;

    if (Array.isArray(candidate)) return candidate;
    if (Array.isArray(candidate?.feedback)) return candidate.feedback;
    if (Array.isArray(candidate?.respuestas)) return candidate.respuestas;
    return [];
};

export const feedbackField = (feedback, ...names) => {
    for (const name of names) {
        if (feedback?.[name] !== undefined && feedback?.[name] !== null) {
            return feedback[name];
        }
    }
    return "";
};

export const feedbackId = (feedback) =>
    feedbackField(feedback, "id_feedback", "idFeedback", "id");

export const feedbackStatus = (feedback) =>
    feedbackField(feedback, "estado", "status") || "recibida";

export const feedbackCreatedAt = (feedback) =>
    feedbackField(feedback, "fecha_creacion", "created_at", "createdAt");

export const calculateFeedbackMetrics = (items) => {
    const satisfaction = items
        .map((item) => Number(feedbackField(item, "satisfaccion_general", "satisfaccion", "satisfaction")))
        .filter((value) => Number.isFinite(value) && value >= 1 && value <= 5);
    const recommendation = items
        .map((item) => Number(feedbackField(item, "recomendacion", "nps")))
        .filter((value) => Number.isFinite(value) && value >= 0 && value <= 10);

    const averageSatisfaction = satisfaction.length
        ? satisfaction.reduce((sum, value) => sum + value, 0) / satisfaction.length
        : null;

    const promoters = recommendation.filter((value) => value >= 9).length;
    const detractors = recommendation.filter((value) => value <= 6).length;
    const nps = recommendation.length
        ? Math.round(((promoters - detractors) / recommendation.length) * 100)
        : null;

    return {
        total: items.length,
        averageSatisfaction,
        nps,
        pending: items.filter((item) => !["implementada", "descartada"].includes(feedbackStatus(item))).length,
    };
};
