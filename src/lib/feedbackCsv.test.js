import { describe, expect, it } from "vitest";
import { buildFeedbackCsv } from "./feedbackCsv.js";

describe("feedback CSV export", () => {
    it("quotes commas and double quotes", () => {
        const csv = buildFeedbackCsv([
            {
                id_feedback: 1,
                comentario: 'Más filtros, y botón "volver"',
                estado: "recibida",
            },
        ]);

        expect(csv).toContain('"Más filtros, y botón ""volver"""');
    });

    it("protects cells from spreadsheet formula injection", () => {
        const csv = buildFeedbackCsv([
            { id_feedback: 2, comentario: "=HYPERLINK(\"https://example.test\")" },
        ]);

        expect(csv).toContain('"\'=HYPERLINK(""https://example.test"")"');
    });

    it("uses translated column names", () => {
        const csv = buildFeedbackCsv([], (key) => `translated:${key}`);
        expect(csv).toContain('"translated:feedback.csv.id"');
        expect(csv.split("\r\n")).toHaveLength(1);
    });
});
