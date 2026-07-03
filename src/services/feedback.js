import { postAPI } from "../lib/methodAPIs.js";

export const crearFeedback = async (feedback) => {
    return await postAPI("/api/v1/feedback/crear", feedback);
};

export const obtenerMiFeedback = async () => {
    return await postAPI("/api/v1/feedback/mis-respuestas");
};

export const obtenerFeedback = async () => {
    return await postAPI("/api/v1/feedback/listar");
};

export const actualizarFeedback = async (idFeedback, estado, respuestaAdministracion) => {
    return await postAPI("/api/v1/feedback/actualizar-estado", {
        id_feedback: idFeedback,
        estado,
        respuesta_administracion: respuestaAdministracion,
    });
};
