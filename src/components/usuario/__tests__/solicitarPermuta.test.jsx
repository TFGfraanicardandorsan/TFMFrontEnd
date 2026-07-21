// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "../../../i18n.js";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock("../../../services/grupo.js", () => ({
  obtenerTodosGruposMisAsignaturasSinGrupoUsuario: vi.fn(),
}));

vi.mock("../../../services/permuta.js", () => ({
  solicitarPermuta: vi.fn(),
}));

vi.mock("../../../lib/logger.js", () => ({
  logError: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mocks.navigate };
});

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  },
}));

import { toast } from "react-toastify";
import { obtenerTodosGruposMisAsignaturasSinGrupoUsuario } from "../../../services/grupo.js";
import { solicitarPermuta } from "../../../services/permuta.js";
import SolicitarPermuta from "../solicitarPermuta.jsx";

const gruposDisponibles = [
  { codasignatura: 2050001, nombreasignatura: "Programación", numgrupo: 2 },
  { codasignatura: 2050001, nombreasignatura: "Programación", numgrupo: 3 },
  { codasignatura: 2050001, nombreasignatura: "Programación", numgrupo: 4 },
];

const respuestaCorrecta = {
  err: false,
  result: { err: false, result: {} },
};

describe("SolicitarPermuta - selección multigrupo", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage("es");
    obtenerTodosGruposMisAsignaturasSinGrupoUsuario.mockResolvedValue({
      err: false,
      result: { result: gruposDisponibles },
    });
    solicitarPermuta.mockResolvedValue(respuestaCorrecta);
  });

  afterEach(() => {
    cleanup();
  });

  it("envía varios grupos de una asignatura en una única petición", async () => {
    render(<SolicitarPermuta />);

    fireEvent.click(await screen.findByRole("checkbox", { name: "Grupo 2" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Grupo 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Solicitar Ahora" }));

    await waitFor(() => {
      expect(solicitarPermuta).toHaveBeenCalledTimes(1);
      expect(solicitarPermuta).toHaveBeenCalledWith(2050001, [2, 3]);
    });
    expect(toast.success).toHaveBeenCalled();
    expect(mocks.navigate).toHaveBeenCalledWith("/misSolicitudesPermuta");
  });

  it("permite seleccionar todos los grupos disponibles", async () => {
    render(<SolicitarPermuta />);

    fireEvent.click(await screen.findByRole("button", { name: "Seleccionar todos" }));
    fireEvent.click(screen.getByRole("button", { name: "Solicitar Ahora" }));

    await waitFor(() => {
      expect(solicitarPermuta).toHaveBeenCalledWith(2050001, [2, 3, 4]);
    });
  });

  it("muestra el error del backend y no navega si la solicitud falla", async () => {
    solicitarPermuta.mockResolvedValue({
      err: true,
      errmsg: "Ya existe una solicitud activa para esta asignatura.",
    });
    render(<SolicitarPermuta />);

    fireEvent.click(await screen.findByRole("checkbox", { name: "Grupo 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Solicitar Ahora" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Ya existe una solicitud activa para esta asignatura."
      );
    });
    expect(toast.success).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("ignora un segundo envío mientras el primero sigue pendiente", async () => {
    let resolverSolicitud;
    solicitarPermuta.mockImplementation(() => new Promise((resolve) => {
      resolverSolicitud = resolve;
    }));
    render(<SolicitarPermuta />);

    fireEvent.click(await screen.findByRole("checkbox", { name: "Grupo 2" }));
    const botonEnviar = screen.getByRole("button", { name: "Solicitar Ahora" });
    fireEvent.click(botonEnviar);
    fireEvent.click(botonEnviar);

    expect(solicitarPermuta).toHaveBeenCalledTimes(1);
    resolverSolicitud(respuestaCorrecta);
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledTimes(1));
  });
});
