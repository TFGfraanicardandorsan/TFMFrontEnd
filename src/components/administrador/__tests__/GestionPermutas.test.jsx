// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../services/permuta.js', () => ({
  obtenerPanelGestionPermutas: vi.fn(),
  buscarParejasOptimasAdmin: vi.fn(),
  generarPropuestasAdmin: vi.fn(),
  cancelarSolicitudAdmin: vi.fn(),
  cancelarPermutaAdmin: vi.fn(),
  retirarVigenciaAdmin: vi.fn(),
}));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import {
  buscarParejasOptimasAdmin,
  cancelarPermutaAdmin,
  obtenerPanelGestionPermutas,
} from '../../../services/permuta.js';
import GestionPermutas from '../GestionPermutas.jsx';

const panel = {
  resumen: {
    solicitudes_vigentes: 1, solicitudes_pendientes: 1,
    permutas_vigentes: 1, propuestas_pendientes: 1,
    permutas_confirmadas: 0, documentos_vigentes: 0,
  },
  solicitudes: [{
    solicitud_id: 7, estado: 'SOLICITADA', vigente: true, en_bloque: false,
    usuario_nombre: 'Ana Pérez', usuario_uvus: 'ana', usuario_estudio: 'GII',
    asignatura_nombre: 'Cálculo', asignatura_codigo: 1001,
    grupo_solicitante: '1', grupos_deseados: ['2'],
  }],
  permutas: [{
    permuta_id: 9, estado: 'PROPUESTA', vigente: true, en_bloque: false,
    usuario_1_nombre: 'Ana Pérez', usuario_1_uvus: 'ana',
    usuario_2_nombre: 'Luis Ruiz', usuario_2_uvus: 'luis',
    asignatura_nombre: 'Cálculo', asignatura_codigo: 1001,
    grupo_1: '1', grupo_2: '2', documentos_ids: [],
  }],
};

const respuesta = (result) => ({ err: false, result: { err: false, result } });

describe('GestionPermutas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    obtenerPanelGestionPermutas.mockResolvedValue(respuesta(panel));
  });
  afterEach(cleanup);

  it('muestra resumen, solicitudes y permite buscar parejas sin escribir', async () => {
    buscarParejasOptimasAdmin.mockResolvedValue(respuesta({
      solicitudesAnalizadas: 2,
      asignaturasResueltas: 1,
      parejas: [{
        estudiante1: { id: 1, nombre: 'Ana Pérez', uvus: 'ana' },
        estudiante2: { id: 2, nombre: 'Luis Ruiz', uvus: 'luis' },
        asignaturas: [{ id: 10, nombre: 'Cálculo', codigo: 1001 }],
      }],
    }));
    render(<GestionPermutas />);
    expect(await screen.findByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('Solicitudes vigentes')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Buscar parejas óptimas' }));
    expect(await screen.findByText('Parejas óptimas encontradas')).toBeInTheDocument();
    expect(buscarParejasOptimasAdmin).toHaveBeenCalledOnce();
  });

  it('al cancelar una permuta exige identificar al participante solicitante', async () => {
    cancelarPermutaAdmin.mockResolvedValue(respuesta({
      solicitudesCanceladas: 1, permutasCanceladas: 1, documentosRetirados: 0,
    }));
    render(<GestionPermutas />);
    await screen.findByText('Ana Pérez');
    fireEvent.click(screen.getByRole('tab', { name: /Permutas/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    const dialogo = screen.getByRole('dialog');
    fireEvent.change(within(dialogo).getByRole('combobox'), { target: { value: 'luis' } });
    fireEvent.change(within(dialogo).getByRole('textbox'), { target: { value: 'Petición de Luis' } });
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Confirmar operación' }));
    await waitFor(() => expect(cancelarPermutaAdmin).toHaveBeenCalledWith(9, 'luis', 'Petición de Luis'));
  });
});
