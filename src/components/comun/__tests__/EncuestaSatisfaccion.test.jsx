// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../../../i18n.js";

vi.mock("../../../services/feedback.js", () => ({
    crearFeedback: vi.fn(),
    obtenerMiFeedback: vi.fn(),
}));

vi.mock("react-toastify", () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

import { crearFeedback, obtenerMiFeedback } from "../../../services/feedback.js";
import EncuestaSatisfaccion from "../EncuestaSatisfaccion.jsx";

describe("EncuestaSatisfaccion", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        obtenerMiFeedback.mockResolvedValue({ result: { result: [] } });
    });

    afterEach(() => {
        cleanup();
    });

    it("shows the non-intrusive form and the personal history", async () => {
        render(<EncuestaSatisfaccion />);

        expect(screen.getByRole("heading", { name: "Ayúdanos a mejorar Permutas ETSII" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Enviar mi opinión" })).toBeInTheDocument();
        expect(await screen.findByText("Todavía no has enviado ninguna aportación.")).toBeInTheDocument();
    });

    it("submits the ratings, suggestion, and follow-up preference", async () => {
        crearFeedback.mockResolvedValue({ err: false, result: { id_feedback: 7 } });
        render(<EncuestaSatisfaccion />);
        await screen.findByText("Todavía no has enviado ninguna aportación.");

        const satisfaction = screen.getByRole("group", {
            name: "¿Cuál es tu satisfacción general con el sistema?",
        });
        const ease = screen.getByRole("group", {
            name: "¿Cómo de fácil te resulta utilizar la aplicación?",
        });
        const recommendation = screen.getByRole("group", {
            name: "¿Qué probabilidad hay de que recomiendes la aplicación?",
        });

        fireEvent.click(within(satisfaction).getByRole("radio", { name: "4" }));
        fireEvent.click(within(ease).getByRole("radio", { name: "5" }));
        fireEvent.click(within(recommendation).getByRole("radio", { name: "9" }));
        fireEvent.change(screen.getByLabelText("¿Sobre qué quieres hablarnos?"), {
            target: { value: "mejora" },
        });
        fireEvent.change(screen.getByLabelText("Sugerencia o comentario"), {
            target: { value: "Añadir filtros por curso" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Enviar mi opinión" }));

        await waitFor(() => {
            expect(crearFeedback).toHaveBeenCalledWith({
                satisfaccion_general: 4,
                facilidad_uso: 5,
                recomendacion: 9,
                tipo_aporte: "mejora",
                comentario: "Añadir filtros por curso",
                solicita_seguimiento: true,
            });
        });
    });
});
