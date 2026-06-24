// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../../services/estudio', () => ({
  obtenerEstudios: vi.fn(),
}));

vi.mock('../../../services/grupo', () => ({
  crearGrupoAsignatura: vi.fn(),
  crearGruposCursoGrado: vi.fn(),
  eliminarUltimoGrupoAsignatura: vi.fn(),
  eliminarUltimosGruposAsignaturas: vi.fn(),
  eliminarUltimosGruposCursoGrado: vi.fn(),
}));

import { obtenerEstudios } from '../../../services/estudio';
import {
  crearGrupoAsignatura,
  eliminarUltimosGruposAsignaturas,
} from '../../../services/grupo';
import PanelGestionGrupos from '../panelGestionGrupos.jsx';

const estudiosResponse = {
  err: false,
  result: {
    err: false,
    result: [
      { id: 1, nombre: 'Grado en Ingeniería Informática' },
      { id: 2, nombre: 'Grado en Ingeniería de la Salud' },
    ],
  },
};

const resultadoCreacion = {
  err: false,
  result: {
    err: false,
    result: {
      asignaturasProcesadas: 1,
      gruposCreados: [
        {
          id: 10,
          numGrupo: '4',
          codigoAsignatura: 2050001,
          nombreAsignatura: 'Matemáticas',
          curso: 'PRIMERO',
        },
      ],
    },
  },
};

describe('PanelGestionGrupos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    obtenerEstudios.mockResolvedValue(estudiosResponse);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('carga los grados y muestra el panel', async () => {
    render(<PanelGestionGrupos />);

    expect(await screen.findByText('Panel de Gestión de Grupos')).toBeInTheDocument();
    expect(screen.getAllByText('Grado en Ingeniería Informática').length).toBeGreaterThan(0);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('crea el siguiente grupo de una asignatura', async () => {
    crearGrupoAsignatura.mockResolvedValueOnce(resultadoCreacion);

    render(<PanelGestionGrupos />);

    await screen.findByText('Panel de Gestión de Grupos');
    const codigoInputs = screen.getAllByLabelText('Asignatura');
    fireEvent.change(codigoInputs[0], { target: { value: '2050001' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear siguiente grupo' }));

    expect(crearGrupoAsignatura).toHaveBeenCalledWith(2050001);
    expect(await screen.findByText('Grupo creado correctamente')).toBeInTheDocument();
    expect(screen.getByText('Grupo 4')).toBeInTheDocument();
  });

  it('elimina los últimos grupos de varias asignaturas tras confirmar', async () => {
    eliminarUltimosGruposAsignaturas.mockResolvedValueOnce({
      err: false,
      result: {
        err: false,
        result: {
          asignaturasProcesadas: 2,
          gruposEliminados: [
            {
              id: 10,
              numGrupo: '4',
              codigoAsignatura: 2050001,
              nombreAsignatura: 'Matemáticas',
              curso: 'PRIMERO',
            },
          ],
        },
      },
    });

    render(<PanelGestionGrupos />);

    await screen.findByText('Panel de Gestión de Grupos');
    fireEvent.change(screen.getByLabelText('Varias asignaturas'), { target: { value: '2050001, 2050002' } });
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar últimos grupos' }));

    await waitFor(() => {
      expect(eliminarUltimosGruposAsignaturas).toHaveBeenCalledWith([2050001, 2050002]);
    });
    expect(window.confirm).toHaveBeenCalled();
    expect(await screen.findByText('Grupos eliminados correctamente')).toBeInTheDocument();
  });
});
