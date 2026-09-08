// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../../i18n.js';

vi.mock('../../../services/estudio.js', () => ({
  obtenerEstudios: vi.fn(),
}));

vi.mock('../../../services/usuario.js', () => ({
  actualizarEstudiosUsuario: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import { obtenerEstudios } from '../../../services/estudio.js';
import { actualizarEstudiosUsuario } from '../../../services/usuario.js';
import SeleccionarEstudio from '../seleccionarEstudio.jsx';

describe('SeleccionarEstudio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    obtenerEstudios.mockResolvedValue({
      err: false,
      result: {
        result: [
          { id: 1, nombre: 'GII' },
          { id: 2, nombre: 'GISA' },
        ],
      },
    });
  });

  afterEach(() => cleanup());

  it('permite actualizar el grado desde el valor actual', async () => {
    actualizarEstudiosUsuario.mockResolvedValue({
      err: false,
      result: { err: false, result: 'Estudios actualizados' },
    });
    const onEstudioActualizado = vi.fn();

    render(
      <SeleccionarEstudio
        estudioActual="GII"
        onEstudioActualizado={onEstudioActualizado}
        onCancel={vi.fn()}
      />
    );

    const selector = await screen.findByRole('combobox');
    expect(selector).toHaveValue('GII');
    expect(screen.getByRole('button', { name: 'Actualizar grado' })).toBeDisabled();

    fireEvent.change(selector, { target: { value: 'GISA' } });
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar grado' }));

    await waitFor(() => {
      expect(actualizarEstudiosUsuario).toHaveBeenCalledWith('GISA');
      expect(onEstudioActualizado).toHaveBeenCalledWith('GISA');
    });
  });
});
