// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../../../services/permuta.js";
import Permutas from "../permutas.jsx";
import i18n from "../../../i18n.js";
vi.mock("../../../services/permuta.js", () => ({ obtenerPermutasInteresantes: vi.fn(), obtenerPermutasPropuestasSistema: vi.fn(), aceptarPermutaPropuestaSistema: vi.fn(), rechazarPermutaPropuestaSistema: vi.fn(), aceptarPermutaSolicitudesPermuta: vi.fn(), misPermutasPropuestas: vi.fn(), misPermutasPropuestasPorMi: vi.fn() }));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
const ok = result => ({ err: false, result: { err: false, result } });
const filas = [{ permuta_id: 10, bloque_id: 'propuesta-uuid', curso: 'PRIMERO', nombre_asignatura: 'A', grupo_actual: 1, grupo_destino: 2, companero_nombre: 'Ana García' }, { permuta_id: 11, bloque_id: 'propuesta-uuid', curso: 'PRIMERO', nombre_asignatura: 'B', grupo_actual: 3, grupo_destino: 1, companero_nombre: 'Ana García' }];
afterEach(cleanup);
beforeEach(async () => {
  vi.resetAllMocks(); await i18n.changeLanguage('es');
  api.obtenerPermutasPropuestasSistema.mockResolvedValue(ok(filas));
  api.obtenerPermutasInteresantes.mockResolvedValue(ok([]));
  api.aceptarPermutaPropuestaSistema.mockResolvedValue(ok({}));
  api.rechazarPermutaPropuestaSistema.mockResolvedValue(ok({}));
  api.misPermutasPropuestas.mockResolvedValue(ok([])); api.misPermutasPropuestasPorMi.mockResolvedValue(ok([]));
});
const mostrar = () => render(<MemoryRouter><Permutas /></MemoryRouter>);
describe('propuestas en bloque', () => {
  it.each([['Aceptar bloque', 'aceptarPermutaPropuestaSistema'], ['Rechazar bloque', 'rechazarPermutaPropuestaSistema']])('%s usa un solo miembro y recarga propuestas y permutas', async (nombre, metodo) => {
    mostrar(); const boton = await screen.findByRole('button', { name: nombre });
    expect(screen.getByText('A')).toBeVisible(); expect(screen.getByText('B')).toBeVisible();
    expect(screen.getAllByRole('button', { name: nombre })).toHaveLength(1);
    fireEvent.click(boton); fireEvent.click(boton);
    await waitFor(() => expect(api[metodo]).toHaveBeenCalledTimes(1)); expect(api[metodo]).toHaveBeenCalledWith(10);
    await waitFor(() => expect(api.obtenerPermutasPropuestasSistema).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(api.misPermutasPropuestas).toHaveBeenCalledTimes(1)); expect(api.misPermutasPropuestasPorMi).toHaveBeenCalledTimes(1);
  });
  it('agrupa por UUID, no por curso, y conserva propuestas antiguas', async () => {
    api.obtenerPermutasPropuestasSistema.mockResolvedValue(ok([...filas, { ...filas[0], permuta_id: 12, bloque_id: 'otro-uuid' }, { ...filas[0], permuta_id: 13, bloque_id: null }]));
    mostrar(); expect(await screen.findAllByRole('button', { name: 'Aceptar bloque' })).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Aceptar', exact: true })).toBeVisible();
  });
  it('oculta la aceptación individual cuando la API la prohíbe', async () => {
    api.obtenerPermutasInteresantes.mockResolvedValue(ok([{ solicitud_id: 20, aceptable_individual: false, bloque_id: null }]));
    mostrar(); expect(await screen.findByText('Se gestiona desde propuestas del sistema.')).toBeVisible();
    expect(api.aceptarPermutaSolicitudesPermuta).not.toHaveBeenCalled();
  });
  it('muestra el nombre completo antes de aceptar propuestas automáticas y solicitudes directas', async () => {
    api.obtenerPermutasInteresantes.mockResolvedValue(ok([{ solicitud_id: 20, siglas_asignatura: 'IA', grupo_solicitante: 1, grupo_deseado: 2, estudiante_nombre: 'Bruno López' }]));
    mostrar();
    expect((await screen.findAllByText(/Ana García/)).length).toBeGreaterThan(0);
    expect(screen.getByText(/Bruno López/)).toBeVisible();
  });
});
