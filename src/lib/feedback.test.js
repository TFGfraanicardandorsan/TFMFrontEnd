import { describe, expect, it } from "vitest";
import {
    calculateFeedbackMetrics,
    feedbackId,
    unwrapFeedbackList,
} from "./feedback.js";

describe("feedback helpers", () => {
    it("normalizes the nested API response", () => {
        const items = [{ id_feedback: 12 }];
        expect(unwrapFeedbackList({ result: { result: items } })).toEqual(items);
        expect(feedbackId(items[0])).toBe(12);
    });

    it("calculates satisfaction, NPS and open follow-ups", () => {
        const metrics = calculateFeedbackMetrics([
            { satisfaccion_general: 5, recomendacion: 10, estado: "implementada" },
            { satisfaccion_general: 3, recomendacion: 8, estado: "en_revision" },
            { satisfaccion_general: 1, recomendacion: 4, estado: "recibida" },
        ]);

        expect(metrics.total).toBe(3);
        expect(metrics.averageSatisfaction).toBe(3);
        expect(metrics.nps).toBe(0);
        expect(metrics.pending).toBe(2);
    });

    it("returns empty metrics without producing NaN", () => {
        expect(calculateFeedbackMetrics([])).toEqual({
            total: 0,
            averageSatisfaction: null,
            nps: null,
            pending: 0,
        });
    });
});
