import { postAPI, patchAPI}  from "../lib/methodAPIs.js";

export const obtenerNotificaciones = async () => {
    return await postAPI("/api/v1/notificacion/notificaciones")
}

export const crearNotificacion = async (paramReceptor, paramContenido) => {
    return await postAPI("/api/v1/notificacion/insertarNotificacion", {receptor:paramReceptor,contenido:paramContenido})
}

export const notificarCierreIncidencia = async (idIncidencia, contenido) => {
    return await postAPI("/api/v1/notificacion/notificarCierreIncidencia", {
        idIncidencia,
        contenido
    });
};
export const marcarNotificacionLeida = (id, leida = true) => patchAPI('/api/v1/notificacion/' + id + '/lectura', { leida });
export const marcarTodasNotificacionesLeidas = () => postAPI('/api/v1/notificacion/marcarTodasLeidas');
