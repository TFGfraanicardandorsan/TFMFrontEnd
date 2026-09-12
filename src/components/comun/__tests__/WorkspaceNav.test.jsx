// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../../i18n';
import WorkspaceNav from '../WorkspaceNav';
import { obtenerNotificaciones } from '../../../services/notificacion';
vi.mock('../../../services/notificacion', () => ({ obtenerNotificaciones: vi.fn() }));
vi.mock('../ThemeToggle', () => ({ default: () => <button>Tema</button> }));
vi.mock('../../../services/login', () => ({ logout: vi.fn() }));
afterEach(cleanup);
beforeEach(async () => { vi.resetAllMocks(); await i18n.changeLanguage('es'); obtenerNotificaciones.mockResolvedValue({ result: { result: [] } }); });
describe('navegación por tareas', () => {
  it('mantiene la navegación disponible mientras se cargan avisos', () => {
    obtenerNotificaciones.mockReturnValue(new Promise(() => {}));
    render(<MemoryRouter><WorkspaceNav role="estudiante" /></MemoryRouter>);
    const nav=screen.getByRole('navigation', { name: 'Navegación principal' });
    expect(within(nav).getByRole('link', { name: 'Seguimiento' })).toHaveAttribute('href','/seguimiento');
    expect(within(nav).getByRole('link', { name: 'Mi matrícula' })).toHaveAttribute('href','/miPerfil');
  });
  it('ofrece menú con estado accesible y cierra con Escape', async () => {
    render(<MemoryRouter><WorkspaceNav role="estudiante" /></MemoryRouter>);
    const boton=screen.getByRole('button', { name: 'Abrir menú' }); fireEvent.click(boton); expect(boton).toHaveAttribute('aria-expanded','true');
    fireEvent.keyDown(screen.getByRole('navigation', { name: 'Navegación principal' }), { key: 'Escape' }); expect(boton).toHaveAttribute('aria-expanded','false');
    await waitFor(() => expect(obtenerNotificaciones).toHaveBeenCalledTimes(1));
  });
  it('muestra avisos en un diálogo accesible y restaura el foco', async () => {
    render(<MemoryRouter><WorkspaceNav role="estudiante" /></MemoryRouter>);
    const boton=screen.getByRole('button', { name: 'Notificaciones' }); boton.focus(); fireEvent.click(boton);
    expect(await screen.findByRole('dialog')).toBeVisible(); fireEvent.keyDown(document, { key:'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); expect(boton).toHaveFocus();
  });
});
