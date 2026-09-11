import { describe, expect, it } from 'vitest';
import { agruparBloques, completarIdsBloques } from './bloquesPermuta.js';
describe('selección de documentos', () => {
  it('expande todos los miembros del UUID seleccionado sin incluir otro bloque del mismo curso', () => {
    const filas = [{ permuta_id: 1, bloque_id: 'a', curso: 'PRIMERO' }, { permuta_id: 2, bloque_id: 'a' }, { permuta_id: 3, bloque_id: 'b', curso: 'PRIMERO' }, { permuta_id: 4, bloque_id: null }];
    expect(completarIdsBloques([1, 4], filas)).toEqual([1, 4, 2]);
    expect(agruparBloques(filas)).toHaveLength(3);
    expect(completarIdsBloques([4], filas)).toEqual([4]);
  });
});
