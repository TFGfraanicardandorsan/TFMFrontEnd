// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "../../../i18n.js";

const mocks = vi.hoisted(() => ({
  listarPermutas: vi.fn(),
  verListaPermutas: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("../../../services/permuta.js", () => ({
  listarPermutas: mocks.listarPermutas,
  verListaPermutas: mocks.verListaPermutas,
  firmarPermuta: vi.fn(),
  aceptarPermuta: vi.fn(),
  validarSolicitudPermuta: vi.fn(),
}));

vi.mock("../../../services/subidaArchivos.js", () => ({
  obtenerPlantillaPermuta: vi.fn(),
  subidaArchivo: vi.fn(),
  servirArchivo: vi.fn(),
}));

vi.mock("../../../lib/logger.js", () => ({
  logError: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: { IdsPermuta: [10] } }),
  };
});

vi.mock("react-toastify", () => ({
  toast: {
    error: mocks.toastError,
    warning: vi.fn(),
    success: vi.fn(),
  },
}));

import GeneracionPDF from "../generacionPDF.jsx";

const grupoConHistorico = {
  usuarios: [
    { nombre_completo: "Alumno Uno", uvus: "alumno1", estudio: "GII-IS" },
    { nombre_completo: "Alumno Dos", uvus: "alumno2", estudio: "GII-IS" },
  ],
  permutas: [
    { permuta_id: 10, nombre_asignatura: "Actual", codigo_asignatura: 100 },
    { permuta_id: 11, nombre_asignatura: "Histórica", codigo_asignatura: 200 },
  ],
};

describe("GeneracionPDF - carga del documento", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage("es");
    mocks.verListaPermutas.mockResolvedValue({
      err: false,
      result: { err: false, result: [grupoConHistorico] },
    });
    mocks.listarPermutas.mockResolvedValue({
      err: false,
      result: { error: false, result: [{ id: 42, estado: "BORRADOR", archivo: null }] },
    });
  });

  afterEach(cleanup);

  it("consulta únicamente los IDs seleccionados aunque la pareja tenga históricos", async () => {
    render(<GeneracionPDF />);

    await waitFor(() => expect(mocks.listarPermutas).toHaveBeenCalledWith([10]));
    expect(screen.getByRole("button", { name: "Visualizar" })).toBeEnabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("bloquea la generación y muestra el fallo de carga del backend", async () => {
    mocks.listarPermutas.mockResolvedValue({
      err: true,
      errmsg: "Las permutas no pertenecen al mismo documento",
    });

    render(<GeneracionPDF />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Las permutas no pertenecen al mismo documento"
    );
    expect(screen.getByRole("button", { name: "Visualizar" })).toBeDisabled();
    expect(mocks.toastError).toHaveBeenCalled();
  });
});
