// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "../../../i18n.js";
import { obtenerEstadisticasValoracionesAsignaturas } from "../../../services/estadisticas.js";
import ValoracionesAsignaturas from "../ValoracionesAsignaturas.jsx";

vi.mock("../../../services/estadisticas.js", () => ({
  obtenerEstadisticasValoracionesAsignaturas: vi.fn(),
}));

const respuesta = (result) => ({ err: false, result: { err: false, result } });
const valoraciones = [
  {
    codigo: 1001,
    siglas: "ÁLG",
    nombre: "Álgebra Lineal",
    totalValoraciones: 3,
    comparativaGrupos: [{
      cursoAcademico: "2025-2026",
      grupos: [{ grupoId: 1, grupoNumero: 1, mediaGlobal: 8.5, totalValoraciones: 2 }],
    }],
    bloques: [{
      bloque: 1,
      bloqueNombre: "Docencia",
      preguntas: [
        { id: 1, codigo: "valoracion_global", enunciado: "Valoración global", tipoRespuesta: "escala_1_10", estadisticas: { media: 8.5, minimo: 7, maximo: 10 } },
        { id: 2, enunciado: "Comentario", tipoRespuesta: "texto", estadisticas: { respuestas: [{ respuesta: "Muy útil" }] } },
      ],
    }],
  },
  {
    codigo: 2002,
    siglas: "PROG",
    nombre: "Programación",
    totalValoraciones: 1,
    comparativaGrupos: [],
    bloques: [],
  },
  { codigo: 3003, siglas: "SIN", nombre: "Sin respuestas", totalValoraciones: 0, bloques: [] },
];

describe("ValoracionesAsignaturas", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage("es");
    obtenerEstadisticasValoracionesAsignaturas.mockResolvedValue(respuesta(valoraciones));
  });

  afterEach(cleanup);

  it("carga el detalle completo en su propio panel", async () => {
    render(<ValoracionesAsignaturas />);

    expect(screen.getByRole("heading", { name: "Detalle de valoraciones de asignaturas" })).toBeVisible();
    expect(await screen.findByText(/Álgebra Lineal/)).toBeVisible();
    expect(screen.getByText("Grupo 1")).toBeVisible();
    expect(screen.getByText("8.5/10")).toBeVisible();
    expect(screen.getByText("Muy útil")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("2 asignaturas · 4 valoraciones");
    expect(screen.queryByText(/Sin respuestas \(SIN\)/)).not.toBeInTheDocument();
  });

  it("permite buscar por nombre, siglas o código ignorando acentos", async () => {
    render(<ValoracionesAsignaturas />);
    await screen.findByText(/Álgebra Lineal/);

    fireEvent.change(screen.getByRole("searchbox", { name: "Buscar asignatura" }), { target: { value: "algebra" } });
    expect(screen.getByText(/Álgebra Lineal/)).toBeVisible();
    expect(screen.queryByText(/Programación/)).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox", { name: "Buscar asignatura" }), { target: { value: "999" } });
    expect(screen.getByText("No hay asignaturas que coincidan con la búsqueda.")).toBeVisible();
  });

  it("permite reintentar la carga desde el propio panel", async () => {
    obtenerEstadisticasValoracionesAsignaturas
      .mockResolvedValueOnce({ err: true, message: "Fallo temporal" })
      .mockResolvedValueOnce(respuesta(valoraciones));
    render(<ValoracionesAsignaturas />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Fallo temporal");
    fireEvent.click(screen.getByRole("button", { name: "Actualizar" }));
    await waitFor(() => expect(obtenerEstadisticasValoracionesAsignaturas).toHaveBeenCalledTimes(2));
    expect(await screen.findByText(/Álgebra Lineal/)).toBeVisible();
  });
});
