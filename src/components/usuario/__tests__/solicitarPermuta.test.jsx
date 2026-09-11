// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "../../../i18n.js";
import { toast } from "react-toastify";
import * as grupos from "../../../services/grupo.js";
import * as api from "../../../services/permuta.js";
import SolicitarPermuta from "../solicitarPermuta.jsx";
vi.mock("../../../services/grupo.js", () => ({ obtenerMiGrupoAsignatura: vi.fn(), obtenerTodosGruposMisAsignaturasSinGrupoUsuario: vi.fn() }));
vi.mock("../../../services/permuta.js", () => ({ obtenerCursosPermuta: vi.fn(), obtenerSolicitudesPermuta: vi.fn(), solicitarPermutaCurso: vi.fn() }));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
const ok = result => ({ err: false, result: { err: false, result } });
const matricula = [{ curso: "PRIMERO", asignaturas: [{ codigo_asignatura: 101, nombre_asignatura: "A" }, { codigo_asignatura: 102, nombre_asignatura: "B" }] }, { curso: "SEGUNDO", asignaturas: [{ codigo_asignatura: 201, nombre_asignatura: "C" }] }];
const cargar = async () => { render(<MemoryRouter><SolicitarPermuta /></MemoryRouter>); return within(await screen.findByRole('form', { name: 'PRIMERO' })); };
const prepararBloque = f => { fireEvent.click(f.getByRole('switch')); fireEvent.click(f.getByRole('checkbox', { name: 'Grupo 2' })); fireEvent.click(f.getByRole('checkbox', { name: 'Grupo 1' })); };
afterEach(cleanup);
beforeEach(async () => {
  vi.resetAllMocks(); await i18n.changeLanguage('es');
  api.obtenerCursosPermuta.mockResolvedValue({ err: false, result: matricula });
  api.obtenerSolicitudesPermuta.mockResolvedValue(ok([]));
  api.solicitarPermutaCurso.mockResolvedValue(ok({ solicitudes_ids: [1, 2] }));
  grupos.obtenerMiGrupoAsignatura.mockResolvedValue(ok([{ codigo: 101, numgrupo: 1 }, { codigo: 102, numgrupo: 3 }, { codigo: 201, numgrupo: 1 }]));
  grupos.obtenerTodosGruposMisAsignaturasSinGrupoUsuario.mockResolvedValue(ok([{ codasignatura: 101, numgrupo: 2, id: 22 }, { codasignatura: 101, numgrupo: 4, id: 44 }, { codasignatura: 102, numgrupo: 1, id: 11 }, { codasignatura: 201, numgrupo: 5, id: 55 }]));
});
describe('solicitudes por curso', () => {
  it('envía todo un curso en una sola petición con códigos y números, nunca IDs', async () => {
    const f = await cargar(); prepararBloque(f);
    expect(f.getByRole('checkbox', { name: 'A' })).toBeDisabled();
    expect(f.getByRole('checkbox', { name: 'B' })).toBeChecked();
    fireEvent.click(f.getByRole('button', { name: /Enviar/ }));
    await waitFor(() => expect(api.solicitarPermutaCurso).toHaveBeenCalledWith('PRIMERO', true, [{ asignatura: 101, grupos_deseados: [2] }, { asignatura: 102, grupos_deseados: [1] }]));
    expect(api.solicitarPermutaCurso).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(api.obtenerSolicitudesPermuta).toHaveBeenCalledTimes(2));
  });
  it('mantiene dos cursos con modos y destinos independientes', async () => {
    const f = await cargar(); prepararBloque(f);
    const segundo = within(screen.getByRole('form', { name: 'SEGUNDO' }));
    expect(segundo.getByRole('switch')).not.toBeChecked();
    fireEvent.click(segundo.getByRole('checkbox', { name: 'C' }));
    fireEvent.click(segundo.getByRole('checkbox', { name: 'Grupo 5' }));
    fireEvent.click(f.getByRole('button', { name: /Enviar/ }));
    await waitFor(() => expect(api.obtenerSolicitudesPermuta).toHaveBeenCalledTimes(2));
    expect(segundo.getByRole('checkbox', { name: 'Grupo 5' })).toBeChecked();
    fireEvent.click(segundo.getByRole('button', { name: /Enviar/ }));
    await waitFor(() => expect(api.solicitarPermutaCurso).toHaveBeenLastCalledWith('SEGUNDO', false, [{ asignatura: 201, grupos_deseados: [5] }]));
  });
  it('permite dos bloques separados', async () => {
    const f = await cargar(); prepararBloque(f);
    const segundo = within(screen.getByRole('form', { name: 'SEGUNDO' }));
    fireEvent.click(segundo.getByRole('switch')); fireEvent.click(segundo.getByRole('checkbox', { name: 'Grupo 5' }));
    fireEvent.click(f.getByRole('button', { name: /Enviar/ })); fireEvent.click(segundo.getByRole('button', { name: /Enviar/ }));
    await waitFor(() => expect(api.solicitarPermutaCurso).toHaveBeenCalledTimes(2));
    expect(api.solicitarPermutaCurso.mock.calls.map(c => c.slice(0, 2))).toEqual([['PRIMERO', true], ['SEGUNDO', true]]);
  });
  it('envía un subconjunto individual con varios destinos', async () => {
    const f = await cargar(); fireEvent.click(f.getByRole('checkbox', { name: 'A' }));
    fireEvent.click(f.getByRole('checkbox', { name: 'Grupo 2' })); fireEvent.click(f.getByRole('checkbox', { name: 'Grupo 4' }));
    fireEvent.click(f.getByRole('button', { name: /Enviar/ }));
    await waitFor(() => expect(api.solicitarPermutaCurso).toHaveBeenCalledWith('PRIMERO', false, [{ asignatura: 101, grupos_deseados: [2, 4] }]));
  });
  it('conserva asignaturas sin grupo y bloquea el bloque incompleto', async () => {
    grupos.obtenerMiGrupoAsignatura.mockResolvedValue(ok([{ codigo: 101, numgrupo: 1 }]));
    const f = await cargar(); fireEvent.click(f.getByRole('switch'));
    expect(f.getByRole('checkbox', { name: 'B' })).toBeChecked();
    expect(f.getByText(/Debes asignar/)).toBeVisible(); expect(f.getByRole('button', { name: /Enviar/ })).toBeDisabled();
  });
  it('exige destinos en todas las asignaturas del bloque', async () => {
    const f = await cargar(); fireEvent.click(f.getByRole('switch')); fireEvent.click(f.getByRole('checkbox', { name: 'Grupo 2' }));
    expect(f.getByRole('button', { name: /Enviar/ })).toBeDisabled();
  });
  it('explica los conflictos antes de crear y no cancela automáticamente', async () => {
    api.obtenerSolicitudesPermuta.mockResolvedValue(ok([{ codigo_asignatura: 101, estado: 'SOLICITADA', bloque_id: null }]));
    const f = await cargar(); prepararBloque(f);
    expect(f.getByText(/Ya tienes solicitudes activas/)).toBeVisible(); expect(f.getByRole('button', { name: /Enviar/ })).toBeDisabled();
    expect(api.solicitarPermutaCurso).not.toHaveBeenCalled();
  });
  it('recarga matrícula al recibir 400 y conserva solo destinos válidos', async () => {
    const f = await cargar(); prepararBloque(f);
    api.solicitarPermutaCurso.mockResolvedValue({ err: true, status: 400, message: 'Bloque incompleto', detalles: { asignaturas_requeridas: [101, 102, 103] } });
    api.obtenerCursosPermuta.mockResolvedValue({ err: false, result: [{ ...matricula[0], asignaturas: [...matricula[0].asignaturas, { codigo_asignatura: 103, nombre_asignatura: 'D' }] }] });
    fireEvent.click(f.getByRole('button', { name: /Enviar/ }));
    await screen.findByRole('checkbox', { name: 'D' });
    expect(f.getByRole('checkbox', { name: 'Grupo 2' })).toBeChecked(); expect(f.getByRole('button', { name: /Enviar/ })).toBeDisabled();
    expect(toast.error).toHaveBeenCalledWith('Bloque incompleto');
  });
  it('recarga ante 409 sin reintentar', async () => {
    const f = await cargar(); prepararBloque(f);
    api.solicitarPermutaCurso.mockResolvedValue({ err: true, status: 409, message: 'Conflicto activo' });
    fireEvent.click(f.getByRole('button', { name: /Enviar/ }));
    await waitFor(() => expect(api.obtenerSolicitudesPermuta).toHaveBeenCalledTimes(2));
    expect(toast.error).toHaveBeenCalledWith('Conflicto activo'); expect(api.solicitarPermutaCurso).toHaveBeenCalledTimes(1);
  });
  it('bloquea dobles envíos y reconcilia el resultado incierto antes de repetir', async () => {
    let resolve;
    api.solicitarPermutaCurso.mockImplementation(() => new Promise(r => { resolve = r; }));
    const f = await cargar(); prepararBloque(f); const boton = f.getByRole('button', { name: /Enviar/ });
    fireEvent.click(boton); fireEvent.click(boton); expect(api.solicitarPermutaCurso).toHaveBeenCalledTimes(1);
    api.obtenerSolicitudesPermuta.mockResolvedValue(ok([{ curso: 'PRIMERO', codigo_asignatura: 101, estado: 'SOLICITADA', bloque_id: 'creado' }]));
    resolve({ err: true, incierto: true, errmsg: 'Red interrumpida' });
    await waitFor(() => expect(api.obtenerSolicitudesPermuta).toHaveBeenCalledTimes(2));
    await screen.findByText(/Ya tienes solicitudes activas/); expect(boton).toBeDisabled();
  });
});
