import { postAPI}  from "../lib/methodAPIs.js";

export const obtenerNotificaciones = async () => {
    return await postAPI("/api/v1/notificacion/notificaciones")
}

export const crearNotificacion = async (paramReceptor, paramContenido) => {
    return await postAPI("/api/v1/notificacion/insertarNotificacion", {receptor:paramReceptor,contenido:paramContenido})
}