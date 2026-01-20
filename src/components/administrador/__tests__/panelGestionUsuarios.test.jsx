import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../services/usuario', () => ({
  obtenerTodosUsuarios: vi.fn(),
  actualizarUsuario: vi.fn(),
}));

import { obtenerTodosUsuarios, actualizarUsuario } from '../../../services/usuario';
import UserManagementPanel from '../panelGestionUsuarios.jsx';

const sampleUsers = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
];

describe('UserManagementPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', async () => {
    obtenerTodosUsuarios.mockResolvedValueOnce({ data: sampleUsers });

    render(<UserManagementPanel />);

    // Loading indicator should be visible immediately
    expect(screen.getByText('Cargando...')).toBeInTheDocument();

    // Eventually the loading state disappears
    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });
  });

  it('renders users after successful fetch', async () => {
    obtenerTodosUsuarios.mockResolvedValueOnce({ data: sampleUsers });

    render(<UserManagementPanel />);

    // Wait for the title which appears after data is loaded
    expect(await screen.findByText('Panel de Gestión de Usuarios')).toBeInTheDocument();

    // Users are displayed
    expect(screen.getByText('Alice - alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob - bob@example.com')).toBeInTheDocument();

    // Buttons exist
    const buttons = screen.getAllByRole('button', { name: 'Actualizar' });
    expect(buttons).toHaveLength(2);
  });

  it('displays error message when fetch fails', async () => {
    obtenerTodosUsuarios.mockRejectedValueOnce(new Error('Network error'));

    render(<UserManagementPanel />);

    expect(await screen.findByText('Error: Network error')).toBeInTheDocument();
  });

  it('calls actualizarUsuario when clicking Actualizar and keeps list stable with empty update', async () => {
    obtenerTodosUsuarios.mockResolvedValueOnce({ data: sampleUsers });
    actualizarUsuario.mockResolvedValueOnce({});

    render(<UserManagementPanel />);

    // Wait for data to render
    await screen.findByText('Panel de Gestión de Usuarios');

    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(2);

    // Click update on first user
    const firstUpdateButton = within(items[0]).getByRole('button', { name: 'Actualizar' });
    await userEvent.click(firstUpdateButton);

    // actualizarUsuario should have been called with id and an empty update object per component code
    expect(actualizarUsuario).toHaveBeenCalledTimes(1);
    expect(actualizarUsuario).toHaveBeenCalledWith(1, {});

    // The visible list remains stable because no fields were updated
    expect(screen.getByText('Alice - alice@example.com')).toBeInTheDocument();
  });

  it('shows error when update fails and stops rendering the list', async () => {
    obtenerTodosUsuarios.mockResolvedValueOnce({ data: sampleUsers });
    actualizarUsuario.mockRejectedValueOnce(new Error('Update failed'));

    render(<UserManagementPanel />);

    await screen.findByText('Panel de Gestión de Usuarios');

    const updateButtons = screen.getAllByRole('button', { name: 'Actualizar' });
    await userEvent.click(updateButtons[0]);

    // When error occurs in update, component sets error and renders error view
    expect(await screen.findByText('Error: Update failed')).toBeInTheDocument();
  });

  it('renders correct number of list items', async () => {
    obtenerTodosUsuarios.mockResolvedValueOnce({ data: sampleUsers });

    render(<UserManagementPanel />);

    await screen.findByText('Panel de Gestión de Usuarios');

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(sampleUsers.length);
  });
});
