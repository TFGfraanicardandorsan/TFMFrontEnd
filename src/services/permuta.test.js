import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { obtenerCursosPermuta, solicitarPermutaCurso, actualizarGruposDeseadosSolicitud } from './permuta.js';
import { clearCsrfToken } from '../lib/csrf.js';
const response = (payload, status = 200) => ({ ok: status < 400, status, headers: new Headers({ 'content-type': 'application/json' }), json: async () => payload });
beforeEach(() => { clearCsrfToken(); vi.stubGlobal('fetch', vi.fn()); });
afterEach(() => { vi.unstubAllGlobals(); clearCsrfToken(); });
describe('contrato de solicitudes por curso', () => {
  it('consulta matrícula con la sesión y crea con CSRF sin identidad en el cuerpo', async () => {
    fetch.mockResolvedValueOnce(response({ err: false, result: [] })).mockResolvedValueOnce(response({ csrfToken: 'token' })).mockResolvedValueOnce(response({ err: false, result: { bloque_id: 'uuid' } }, 201));
    await obtenerCursosPermuta();
    await solicitarPermutaCurso('PRIMERO', true, [{ asignatura: 2050001, grupos_deseados: [2, 3] }]);
    expect(fetch.mock.calls[0][0]).toMatch(/solicitudPermuta\/cursos$/);
    const [url, config] = fetch.mock.calls[2];
    expect(url).toMatch(/solicitarPermutaCurso$/); expect(config.credentials).toBe('include'); expect(config.headers.get('X-CSRF-Token')).toBe('token');
    expect(JSON.parse(config.body)).toEqual({ curso: 'PRIMERO', en_bloque: true, solicitudes: [{ asignatura: 2050001, grupos_deseados: [2, 3] }] });
  });
  it('mantiene IDs internos en edición y conserva los detalles de los errores', async () => {
    fetch.mockResolvedValueOnce(response({ csrfToken: 'token' })).mockResolvedValueOnce(response({ err: true, message: 'Bloque incompleto', detalles: { asignaturas_requeridas: [2050002] } }, 400));
    const result = await actualizarGruposDeseadosSolicitud(10, [22, 33]);
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ grupos_deseados_ids: [22, 33] });
    expect(result).toMatchObject({ err: true, status: 400, message: 'Bloque incompleto', detalles: { asignaturas_requeridas: [2050002] } });
  });
});
