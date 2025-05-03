import { postAPI } from "../lib/methodAPIs.js";

export const obtenerEstadisticasPermutas = async () => {
    return await postAPI("/api/v1/estadisticas/permutas");
};

export const obtenerEstadisticasSolicitudes = async () => {
    return await postAPI("/api/v1/estadisticas/solicitudes");
};