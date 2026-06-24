// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '../../../i18n';

vi.mock('../../../services/usuario', () => ({
  obtenerTodosUsuarios: vi.fn(),
  actualizarUsuario: vi.fn(),
}));

import { obtenerTodosUsuarios, actualizarUsuario } from '../../../services/usuario';
import UserManagementPanel from '../panelGestionUsuarios.jsx';

const apiUsers = [
  {
    uvus: 'alice',
    nombre_completo: 'Alice',
    correo: 'alice@example.com',
    rol: 'estudiante',
    estudio: 'GII'
  },
  {
    uvus: 'bob',
    nombre_completo: 'Bob',
    correo: 'bob@example.com',
    rol: 'delegacion',
    estudio: 'MII'
  }
];

const mockUsersResponse = () => ({
  result: {
    result: apiUsers
  }
});

describe('UserManagementPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows loading state initially', async () => {
    obtenerTodosUsuarios.mockResolvedValueOnce(mockUsersResponse());

    render(<UserManagementPanel />);

    expect(screen.getByText('Cargando usuarios...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Cargando usuarios...')).not.toBeInTheDocument();
    });
  });

  it('renders users after successful fetch', async () => {
    obtenerTodosUsuarios.mockResolvedValueOnce(mockUsersResponse());

    render(<UserManagementPanel />);

    expect(await screen.findByText(/Panel de Gestión de Usuarios/)).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText(/alice@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/bob@example.com/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Editar/ })).toHaveLength(2);
  });

  it('displays error message when fetch fails', async () => {
    obtenerTodosUsuarios.mockRejectedValueOnce(new Error('Network error'));

    render(<UserManagementPanel />);

    expect(await screen.findByText('Error: Network error')).toBeInTheDocument();
  });

  it('updates a user from the edit modal', async () => {
    obtenerTodosUsuarios.mockResolvedValueOnce(mockUsersResponse());
    actualizarUsuario.mockResolvedValueOnce({});

    render(<UserManagementPanel />);

    await screen.findByText(/Panel de Gestión de Usuarios/);

    fireEvent.click(screen.getAllByRole('button', { name: /Editar/ })[0]);

    expect(screen.getByText(/Editar Usuario/)).toBeInTheDocument();

    const modal = screen.getByText(/Editar Usuario/).closest('.admin-modal-content');
    const nameInput = within(modal).getByDisplayValue('Alice');
    fireEvent.change(nameInput, { target: { value: 'Alice Updated' } });
    fireEvent.click(within(modal).getByRole('button', { name: 'Guardar Cambios' }));

    await waitFor(() => {
      expect(actualizarUsuario).toHaveBeenCalledWith('alice', {
        nombre_completo: 'Alice Updated',
        correo: 'alice@example.com',
        rol: 'estudiante'
      });
    });
  });

  it('updates a user to delegation with the API-compatible role value', async () => {
    obtenerTodosUsuarios.mockResolvedValueOnce(mockUsersResponse());
    actualizarUsuario.mockResolvedValueOnce({});

    render(<UserManagementPanel />);

    await screen.findByText(/Panel de Gestión de Usuarios/);

    fireEvent.click(screen.getAllByRole('button', { name: /Editar/ })[0]);

    const modal = screen.getByText(/Editar Usuario/).closest('.admin-modal-content');
    fireEvent.change(within(modal).getByDisplayValue('Estudiante'), { target: { value: 'delegacion' } });
    fireEvent.click(within(modal).getByRole('button', { name: 'Guardar Cambios' }));

    await waitFor(() => {
      expect(actualizarUsuario).toHaveBeenCalledWith('alice', {
        nombre_completo: 'Alice',
        correo: 'alice@example.com',
        rol: 'delgacion'
      });
    });
  });

  it('filters users by delegation role', async () => {
    obtenerTodosUsuarios.mockResolvedValueOnce(mockUsersResponse());

    render(<UserManagementPanel />);

    await screen.findByText(/Panel de Gestión de Usuarios/);

    fireEvent.change(screen.getByDisplayValue('Todos los roles'), { target: { value: 'delegacion' } });

    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });
});
