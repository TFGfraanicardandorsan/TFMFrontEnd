import { postAPI}  from "../lib/methodAPIs.js";

export const crearIncidencia = async () => {
    return await postAPI("/api/v1/incidencia/crearIncidencia")
}

export const obtenerIncidenciasAsignadasUsuario = async () => {
    return await postAPI("/api/v1/incidencia/obtenerIncidenciasAsignadasUsuario")
}