// Los espacios de IDs de solicitudes y de propuestas se agrupan por separado.
export const agruparBloques = (filas) => {
    const grupos = new Map();
    filas.forEach((fila, index) => {
        const key = fila.bloque_id ? `bloque:${fila.bloque_id}` : `individual:${index}`;
        if (!grupos.has(key)) grupos.set(key, { key, bloque: Boolean(fila.bloque_id), miembros: [] });
        grupos.get(key).miembros.push(fila);
    });
    return [...grupos.values()];
};

export const completarIdsBloques = (ids, filas) => {
    const seleccion = new Set(ids.map(String));
    const bloques = new Set(filas.filter(f => seleccion.has(String(f.permuta_id)) && f.bloque_id).map(f => f.bloque_id));
    return [...new Set([...ids, ...filas.filter(f => bloques.has(f.bloque_id)).map(f => f.permuta_id)])];
};

export const resultadoAPI = (respuesta) => {
    const data = respuesta?.result && !Array.isArray(respuesta.result) &&
        ('result' in respuesta.result || 'err' in respuesta.result) ? respuesta.result : respuesta;
    if (!respuesta || respuesta.err || data?.err) {
        const error = new Error(respuesta?.message || respuesta?.errmsg || data?.message || data?.errmsg || "No se pudo completar la operación");
        Object.assign(error, { status: respuesta?.status, detalles: respuesta?.detalles || data?.detalles, incierto: respuesta?.incierto });
        throw error;
    }
    return data.result;
};

const entero = value => /^\d+$/.test(String(value ?? '')) && Number(value) > 0 && Number.isSafeInteger(Number(value)) ? Number(value) : null;
export const completarCursos = (cursos, actuales, destinos) => cursos.map(curso => ({
    ...curso,
    asignaturas: curso.asignaturas.map(a => {
        const actual = entero(actuales.find(g => String(g.codigo ?? g.codasignatura) === String(a.codigo_asignatura))?.numgrupo);
        const grupos = [...new Set(destinos.filter(g => String(g.codasignatura) === String(a.codigo_asignatura))
            .map(g => entero(g.numgrupo)).filter(g => g && g !== actual))].sort((a, b) => a - b);
        return { ...a, actual, grupos };
    }),
}));
