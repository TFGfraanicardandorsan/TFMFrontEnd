// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import i18n from '../../../i18n';
import useNotificaciones from '../../../hooks/useNotificaciones';
import NotificacionesLista from '../NotificacionesLista';
import { obtenerNotificaciones, marcarNotificacionLeida, marcarTodasNotificacionesLeidas } from '../../../services/notificacion';

vi.mock('../../../services/notificacion', () => ({ obtenerNotificaciones: vi.fn(), marcarNotificacionLeida: vi.fn(), marcarTodasNotificacionesLeidas: vi.fn() }));
const respuesta = result => ({ err: false, result: { error: false, result } });
let datos;
beforeEach(async () => {
  vi.resetAllMocks();
  await i18n.changeLanguage('es');
  datos = [
    { id: 1, contenido: 'Aviso general', tipo: 'ADMINISTRACION', leida: true, fecha_creacion: '2026-09-12T10:00:00Z' },
    { id: 2, contenido: 'Firma pendiente', tipo: 'DOCUMENTO', leida: false, enlace: '/permutasAceptadas', fecha_creacion: '2026-09-11T10:00:00Z' },
  ];
  obtenerNotificaciones.mockImplementation(async () => respuesta(datos.map(n => ({ ...n }))));
  marcarNotificacionLeida.mockImplementation(async (id, leida) => {
    datos = datos.map(n => n.id === id ? { ...n, leida } : n);
    return respuesta({ id, leida });
  });
  marcarTodasNotificacionesLeidas.mockImplementation(async () => {
    datos = datos.map(n => ({ ...n, leida: true })); return respuesta({ actualizadas: datos.length });
  });
});
afterEach(cleanup);

function Centro() { return <NotificacionesLista centro={useNotificaciones()} />; }

it('ordena primero las no leídas, distingue categorías y elimina el color al leer', async () => {
  render(<MemoryRouter><Centro /></MemoryRouter>);
  await screen.findByText('Firma pendiente');
  expect(screen.getAllByRole('article')[0]).toHaveClass('is-unread');
  expect(screen.getAllByRole('article')[0]).toHaveTextContent('Firma y documentos');
  expect(screen.getByRole('link', { name: 'Ver proceso' })).toHaveAttribute('href', '/permutasAceptadas');
  fireEvent.click(screen.getByRole('button', { name: 'Marcar como leída' }));
  await waitFor(() => expect(screen.getAllByRole('article').every(n => n.classList.contains('is-read'))).toBe(true));
  expect(screen.getAllByRole('article')[0]).toHaveTextContent('Aviso general');
  expect(marcarNotificacionLeida).toHaveBeenCalledWith(2, true);
  expect(screen.getByRole('status')).toHaveTextContent('0 notificaciones sin leer');
});

it('sincroniza el panel y la página, y permite volver a marcar como no leída', async () => {
  render(<MemoryRouter><section data-testid="campana"><Centro /></section><section data-testid="inicio"><Centro /></section></MemoryRouter>);
  const campana = within(screen.getByTestId('campana')), inicio = within(screen.getByTestId('inicio'));
  await campana.findByText('Firma pendiente');
  await inicio.findByText('Firma pendiente');
  fireEvent.click(campana.getByRole('button', { name: 'Marcar todas como leídas' }));
  await waitFor(() => expect(inicio.getAllByRole('article').every(n => n.classList.contains('is-read'))).toBe(true));
  fireEvent.click(inicio.getAllByRole('button', { name: 'Marcar como no leída' })[0]);
  await waitFor(() => expect(campana.getAllByRole('article')[0]).toHaveClass('is-unread'));
});

it('un fallo al guardar conserva el estado y se informa de forma accesible', async () => {
  marcarNotificacionLeida.mockResolvedValue({ err: false, result: { error: true } });
  render(<MemoryRouter><Centro /></MemoryRouter>);
  await screen.findByText('Firma pendiente');
  fireEvent.click(screen.getByRole('button', { name: 'Marcar como leída' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo guardar');
  expect(screen.getAllByRole('article')[0]).toHaveClass('is-unread');
});

it('filtra categorías y no sigue enlaces arbitrarios del contenido', async () => {
  datos[0].enlace = 'https://externo.example/';
  render(<MemoryRouter><Centro /></MemoryRouter>);
  await screen.findByText('Firma pendiente');
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ADMINISTRACION' } });
  expect(screen.queryByText('Firma pendiente')).not.toBeInTheDocument();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});
