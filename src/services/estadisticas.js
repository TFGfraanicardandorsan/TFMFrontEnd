import { postAPI } from "../lib/methodAPIs.js";

export const obtenerEstadisticasPermutas = async () => {
    return await postAPI("/api/v1/admin/estadisticas/permutas");
};

export const obtenerEstadisticasSolicitudes = async () => {
    return await postAPI("/api/v1/admin/estadisticas/solicitudes");
};