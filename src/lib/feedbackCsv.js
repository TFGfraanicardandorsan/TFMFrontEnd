import { feedbackCreatedAt, feedbackField, feedbackId, feedbackStatus } from "./feedback.js";

const protectSpreadsheetCell = (value) => {
    const text = String(value ?? "");
    return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
};

const escapeCsvCell = (value) =>
    `"${protectSpreadsheetCell(value).replaceAll('"', '""')}"`;

export const buildFeedbackCsv = (items, translate = (key) => key) => {
    const columns = [
        ["id", (item) => feedbackId(item)],
        ["date", (item) => feedbackCreatedAt(item)],
        ["user", (item) => feedbackField(item, "uvus", "usuario", "user")],
        ["role", (item) => feedbackField(item, "rol", "role")],
        ["satisfaction", (item) => feedbackField(item, "satisfaccion_general", "satisfaccion", "satisfaction")],
        ["ease", (item) => feedbackField(item, "facilidad_uso", "facilidad", "ease")],
        ["recommendation", (item) => feedbackField(item, "recomendacion", "nps")],
        ["category", (item) => feedbackField(item, "tipo_aporte", "categoria", "category")],
        ["comment", (item) => feedbackField(item, "comentario", "sugerencia", "comment")],
        ["follow_up", (item) => feedbackField(item, "solicita_seguimiento", "seguimiento", "followUp")],
        ["status", (item) => feedbackStatus(item)],
        ["admin_response", (item) => feedbackField(item, "respuesta_administracion", "respuesta", "adminResponse")],
    ];

    const header = columns
        .map(([key]) => escapeCsvCell(translate(`feedback.csv.${key}`)))
        .join(",");
    const rows = items.map((item) =>
        columns.map(([, getValue]) => escapeCsvCell(getValue(item))).join(",")
    );

    return [header, ...rows].join("\r\n");
};
