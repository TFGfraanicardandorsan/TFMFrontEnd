// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../../i18n';
import Seguimiento from '../Seguimiento';
import * as api from '../../../services/permuta';
vi.mock('../../../services/permuta', () => ({ obtenerSolicitudesPermuta: vi.fn(), obtenerPermutasPropuestasSistema: vi.fn(), obtenerPermutasAgrupadasPorUsuario: vi.fn(), misPermutasPropuestas: vi.fn(), misPermutasPropuestasPorMi: vi.fn() }));
const ok = result => ({ err: false, result: { err: false, result } });
afterEach(cleanup);
beforeEach(async () => { vi.resetAllMocks(); await i18n.changeLanguage('es'); Object.values(api).forEach(fn => fn.mockResolvedValue(ok([]))); });
const show = () => render(<MemoryRouter><Seguimiento /></MemoryRouter>);
describe('seguimiento unificado', () => {
  it('cuenta un bloque como una unidad y mantiene visibles todas sus asignaturas', async () => {
    api.obtenerSolicitudesPermuta.mockResolvedValue(ok([{ solicitud_id: 1, bloque_id: 'b', nombre_asignatura: 'Álgebra', estado: 'SOLICITADA' }, { solicitud_id: 2, bloque_id: 'b', nombre_asignatura: 'Cálculo', estado: 'SOLICITADA' }]));
    show(); expect(await screen.findByText('Álgebra')).toBeVisible(); expect(screen.getByText('Cálculo')).toBeVisible();
    expect(screen.getByRole('button', { name: /01 \/ Solicitudes/ })).toHaveTextContent('1');
    expect(screen.getByRole('link', { name: /Gestionar solicitudes/ })).toHaveAttribute('href','/misSolicitudesPermuta');
  });
  it('no duplica propuestas presentes en ambos listados y dirige a la acción correcta', async () => {
    const fila = { permuta_id: 4, nombre_asignatura: 'Programación', bloque_id: 'p', estado: 'PROPUESTA' };
    api.obtenerPermutasPropuestasSistema.mockResolvedValue(ok([fila])); api.misPermutasPropuestas.mockResolvedValue(ok([fila]));
    show(); await waitFor(() => expect(screen.getByRole('button', { name: /Actualizar/ })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: /02 \/ Acuerdos/ }));
    expect(screen.getAllByText('Programación')).toHaveLength(1);
    expect(screen.getByRole('link', { name: /Revisar acuerdos/ })).toHaveAttribute('href','/permutas');
  });
  it('distingue un fallo de carga de una lista vacía y permite reintentar', async () => {
    api.obtenerSolicitudesPermuta.mockRejectedValue(new Error('sin red'));
    show(); expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar');
    expect(screen.queryByText('No hay elementos en esta sección.')).not.toBeInTheDocument();
    api.obtenerSolicitudesPermuta.mockResolvedValue(ok([])); fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    await screen.findByText('No hay elementos en esta sección.'); expect(api.obtenerSolicitudesPermuta).toHaveBeenCalledTimes(2);
  });
  it('conserva documentos con todos sus miembros y enlaza al proceso de firma', async () => {
    api.obtenerPermutasAgrupadasPorUsuario.mockResolvedValue(ok([{ permutas: [{ permuta_id: 5, nombre_asignatura: 'Redes', estado_permuta_asociada: 'BORRADOR' }] }]));
    show(); await waitFor(() => expect(screen.getByRole('button', { name: 'Actualizar' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: /03 \/ Documentación/ }));
    const region=screen.getByRole('region', { name: 'Documentación' }); expect(within(region).getByText('Redes')).toBeVisible();
    expect(within(region).getByRole('link', { name: /Revisar documentos/ })).toHaveAttribute('href','/permutasAceptadas');
  });
});
