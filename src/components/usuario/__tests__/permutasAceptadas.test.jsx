// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "../../../i18n.js";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  obtenerPermutas: vi.fn(),
  obtenerSesion: vi.fn(),
  generarBorrador: vi.fn(),
}));

vi.mock("../../../services/permuta.js", () => ({
  obtenerPermutasAgrupadasPorUsuario: mocks.obtenerPermutas,
  generarBorradorPermuta: mocks.generarBorrador,
}));

vi.mock("../../../services/login.js", () => ({
  obtenerSesion: mocks.obtenerSesion,
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mocks.navigate };
});

import PermutasAceptadas from "../permutasAceptadas.jsx";

const respuesta = (estudiante1) => ({
  result: {
    result: [{
      usuarios: ["MTX8324", "pruebalum"],
      estudiante_cumplimentado_1: estudiante1,
      estudiante_cumplimentado_2: null,
      permutas: [{
        permuta_id: 759,
        nombre_asignatura: "Análisis y Diseño de Datos y Algoritmos",
        codigo_asignatura: 2040010,
        grupo_1: 2,
        grupo_2: 1,
        estado: "FINALIZADA",
        estado_permuta_asociada: "BORRADOR",
      }],
    }],
  },
});

describe("PermutasAceptadas", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage("es");
    mocks.obtenerSesion.mockResolvedValue({ user: { uvus: "pruebalum" } });
  });

  afterEach(cleanup);

  it("muestra el botón para un borrador sin estudiante asignado", async () => {
    mocks.obtenerPermutas.mockResolvedValue(respuesta(null));

    render(<PermutasAceptadas />);

    expect(await screen.findByRole("button", { name: "Completar Permuta" })).toBeInTheDocument();
  });

  it("espera la firma si el borrador está asignado al primer estudiante", async () => {
    mocks.obtenerPermutas.mockResolvedValue(respuesta("MTX8324"));

    render(<PermutasAceptadas />);

    await screen.findByText("Análisis y Diseño de Datos y Algoritmos");
    expect(screen.queryByRole("button", { name: "Completar Permuta" })).not.toBeInTheDocument();
  });

  it("incluye todos los miembros del bloque en el documento aunque estén en distintas filas del listado", async () => {
    const data = respuesta(null);
    const grupo = data.result.result[0];
    grupo.permutas[0] = { ...grupo.permutas[0], bloque_id: "documento-bloque", estado_permuta_asociada: null };
    data.result.result.push({ ...grupo, permutas: [{ ...grupo.permutas[0], permuta_id: 760 }] });
    mocks.obtenerPermutas.mockResolvedValue(data);
    mocks.generarBorrador.mockResolvedValue({ err: false, result: { err: false, result: {} } });
    render(<PermutasAceptadas />);
    fireEvent.click((await screen.findAllByRole("button", { name: "Generar Permuta" }))[0]);
    await waitFor(() => expect(mocks.generarBorrador).toHaveBeenCalledWith([759, 760]));
    expect(mocks.navigate).toHaveBeenCalledWith("/generarPermuta", { state: { IdsPermuta: [759, 760] } });
  });
});
