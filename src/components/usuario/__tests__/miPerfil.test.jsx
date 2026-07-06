// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "../../../i18n.js";

vi.mock("../../../services/usuario.js", () => ({
  obtenerDatosUsuario: vi.fn(),
}));

vi.mock("../../../services/grupo.js", () => ({
  obtenerMiGrupoAsignatura: vi.fn(),
}));

vi.mock("../../../services/asignaturas.js", () => ({
  guardarValoracionAsignatura: vi.fn(),
  obtenerPreguntasValoracionAsignatura: vi.fn(),
  superarAsignaturasUsuario: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

import { obtenerDatosUsuario } from "../../../services/usuario.js";
import { obtenerMiGrupoAsignatura } from "../../../services/grupo.js";
import {
  guardarValoracionAsignatura,
  obtenerPreguntasValoracionAsignatura,
  superarAsignaturasUsuario,
} from "../../../services/asignaturas.js";
import MiPerfil from "../miPerfil.jsx";

const asignatura = {
  id: 12,
  numgrupo: "2",
  asignatura: "Matemáticas",
  codigo: 2050001,
  evaluada: false,
  cursoAcademico: "2026-2027",
};

describe("MiPerfil - evaluación independiente", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage("es");
    obtenerDatosUsuario.mockResolvedValue({
      err: false,
      result: {
        result: {
          nombre_completo: "Ada Lovelace",
          correo: "ada@example.com",
          titulacion: "GII",
        },
      },
    });
    obtenerMiGrupoAsignatura.mockResolvedValue({
      err: false,
      result: { result: [asignatura] },
    });
    obtenerPreguntasValoracionAsignatura.mockResolvedValue({
      err: false,
      result: {
        result: [{
          id: 21,
          bloque: 1,
          bloqueNombre: "Valoración",
          enunciado: "Valoración global",
          tipoRespuesta: "escala_1_10",
          condicion: null,
        }],
      },
    });
    guardarValoracionAsignatura.mockResolvedValue({ err: false, result: { result: {} } });
    superarAsignaturasUsuario.mockResolvedValue({ err: false, result: { result: "ok" } });
  });

  afterEach(() => {
    cleanup();
  });

  it("permite evaluar sin superar y mantiene la asignatura matriculada", async () => {
    render(<MiPerfil />);
    await screen.findByText("Matemáticas");

    fireEvent.click(screen.getByRole("button", { name: "Evaluar asignatura" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Grupo 2 · Curso 2026-2027")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "8" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Enviar valoración" }));

    await waitFor(() => {
      expect(guardarValoracionAsignatura).toHaveBeenCalledWith(
        2050001,
        [{ preguntaId: 21, respuesta: 8 }]
      );
    });
    expect(await screen.findByText("Matemáticas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Evaluada este curso" })).toBeDisabled();
    expect(superarAsignaturasUsuario).not.toHaveBeenCalled();
  });

  it("pide confirmación antes de superar una asignatura no evaluada", async () => {
    render(<MiPerfil />);
    await screen.findByText("Matemáticas");

    fireEvent.click(screen.getByRole("button", { name: "Marcar como Aprobada" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", {
      name: "¿Seguro que no quieres evaluar la asignatura?",
    })).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Superar sin evaluar" }));

    await waitFor(() => {
      expect(superarAsignaturasUsuario).toHaveBeenCalledWith(2050001);
      expect(screen.queryByText("Matemáticas")).not.toBeInTheDocument();
    });
    expect(guardarValoracionAsignatura).not.toHaveBeenCalled();
  });
});
