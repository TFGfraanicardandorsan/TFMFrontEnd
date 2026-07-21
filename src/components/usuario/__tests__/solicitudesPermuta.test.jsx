// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "../../../i18n.js";
import SolicitudesPermuta from "../solicitudesPermuta.jsx";
import {
    actualizarGruposDeseadosSolicitud,
    obtenerSolicitudesPermuta,
} from "../../../services/permuta.js";
import { obtenerTodosGruposMisAsignaturasSinGrupoUsuario } from "../../../services/grupo.js";

vi.mock("../../../services/permuta.js", () => ({
    actualizarGruposDeseadosSolicitud: vi.fn(),
    cancelarSolicitudPermuta: vi.fn(),
    obtenerSolicitudesPermuta: vi.fn(),
}));

vi.mock("../../../services/grupo.js", () => ({
    obtenerTodosGruposMisAsignaturasSinGrupoUsuario: vi.fn(),
}));

vi.mock("react-toastify", () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

const solicitudEditable = {
    solicitud_id: 41,
    estado: "Solicitada",
    grupo_solicitante: 1,
    grupos_deseados: [2],
    grupos_deseados_ids: [12],
    codigo_asignatura: 2050001,
    nombre_asignatura: "Programación",
};

const responderCon = (result) => ({
    err: false,
    result: { err: false, result },
});

const renderizar = () => render(
    <BrowserRouter>
        <SolicitudesPermuta />
    </BrowserRouter>
);

afterEach(cleanup);

describe("edición de grupos deseados", () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        await i18n.changeLanguage("es");
        obtenerSolicitudesPermuta.mockResolvedValue(responderCon([solicitudEditable]));
        obtenerTodosGruposMisAsignaturasSinGrupoUsuario.mockResolvedValue(responderCon([
            { id: 12, numgrupo: 2, codasignatura: 2050001 },
            { id: 13, numgrupo: 3, codasignatura: 2050001 },
            { id: 99, numgrupo: 9, codasignatura: 2050999 },
        ]));
        actualizarGruposDeseadosSolicitud.mockResolvedValue({
            err: false,
            result: { err: false, result: { grupos_deseados_ids: [13] } },
        });
    });

    it("precarga la selección y envía el conjunto final de IDs", async () => {
        renderizar();

        fireEvent.click(await screen.findByRole("button", { name: "Editar grupos" }));
        const dialogo = await screen.findByRole("dialog", { name: "Editar grupos deseados" });
        const grupo2 = within(dialogo).getByRole("checkbox", { name: /Grupo 2/ });
        const grupo3 = within(dialogo).getByRole("checkbox", { name: /Grupo 3/ });

        expect(grupo2).toBeChecked();
        expect(grupo2).toBeDisabled();
        expect(grupo3).not.toBeChecked();
        expect(within(dialogo).queryByRole("checkbox", { name: /Grupo 9/ })).not.toBeInTheDocument();

        fireEvent.click(grupo3);
        expect(grupo2).not.toBeDisabled();
        fireEvent.click(grupo2);
        fireEvent.click(within(dialogo).getByRole("button", { name: /Guardar cambios/i }));

        await waitFor(() => {
            expect(actualizarGruposDeseadosSolicitud).toHaveBeenCalledWith(41, [13]);
        });
        await waitFor(() => {
            expect(screen.getByText(/Grupos Deseados:/).closest("p")).toHaveTextContent(
                "Grupos Deseados: 3"
            );
        });
    });

    it("muestra las acciones deshabilitadas si existe una permuta activa", async () => {
        obtenerSolicitudesPermuta.mockResolvedValue(responderCon([
            { ...solicitudEditable, editable: false },
        ]));

        renderizar();

        await screen.findByText("Programación");
        expect(screen.getByRole("button", { name: "Editar grupos" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
        expect(screen.getByRole("note")).toHaveTextContent("Ya existe una permuta activa");
    });

    it("muestra un error de carga y no permite guardar sin opciones válidas", async () => {
        obtenerTodosGruposMisAsignaturasSinGrupoUsuario.mockResolvedValue({
            err: true,
            errmsg: "No autorizado para consultar grupos",
        });

        renderizar();
        fireEvent.click(await screen.findByRole("button", { name: "Editar grupos" }));
        const dialogo = await screen.findByRole("dialog", { name: "Editar grupos deseados" });

        expect(await within(dialogo).findByRole("alert")).toHaveTextContent(
            "No autorizado para consultar grupos"
        );
        expect(within(dialogo).getByRole("button", { name: /Guardar cambios/i })).toBeDisabled();
    });

    it("descarta una carga antigua si se cierra y se abre otra solicitud", async () => {
        const segundaSolicitud = {
            ...solicitudEditable,
            solicitud_id: 42,
            grupos_deseados: [4],
            grupos_deseados_ids: [24],
            codigo_asignatura: 2050002,
            nombre_asignatura: "Bases de Datos",
        };
        let resolverPrimera;
        let resolverSegunda;
        obtenerSolicitudesPermuta.mockResolvedValue(responderCon([
            solicitudEditable,
            segundaSolicitud,
        ]));
        obtenerTodosGruposMisAsignaturasSinGrupoUsuario
            .mockImplementationOnce(() => new Promise((resolve) => { resolverPrimera = resolve; }))
            .mockImplementationOnce(() => new Promise((resolve) => { resolverSegunda = resolve; }));

        renderizar();
        const botonesEditar = await screen.findAllByRole("button", { name: "Editar grupos" });
        fireEvent.click(botonesEditar[0]);
        fireEvent.click(await screen.findByRole("button", { name: "Cerrar" }));
        fireEvent.click(botonesEditar[1]);

        await act(async () => {
            resolverSegunda(responderCon([
                { id: 24, numgrupo: 4, codasignatura: 2050002 },
                { id: 25, numgrupo: 5, codasignatura: 2050002 },
            ]));
        });
        let dialogo = await screen.findByRole("dialog", { name: "Editar grupos deseados" });
        expect(within(dialogo).getByRole("checkbox", { name: /Grupo 4/ })).toBeChecked();

        await act(async () => {
            resolverPrimera(responderCon([
                { id: 12, numgrupo: 2, codasignatura: 2050001 },
            ]));
        });
        dialogo = screen.getByRole("dialog", { name: "Editar grupos deseados" });
        expect(within(dialogo).getByRole("checkbox", { name: /Grupo 4/ })).toBeChecked();
        expect(within(dialogo).queryByRole("checkbox", { name: /Grupo 2/ })).not.toBeInTheDocument();
    });
});
