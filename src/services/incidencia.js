import { postAPI}  from "../lib/methodAPIs.js";

export const crearIncidencia = async (descripcion, tipo_incidencia, fileId) => {
    return await postAPI("/api/v1/incidencia/crearIncidencia",{descripcion, tipo_incidencia, fileId})
}

export const obtenerIncidenciasAsignadasUsuario = async () => {
    return await postAPI("/api/v1/incidencia/obtenerIncidenciasAsignadasUsuario")
}

export const obtenerIncidencias = async () => {
    return await postAPI("/api/v1/incidencia/obtenerIncidencias")
}

export const obtenerIncidenciasAsignadas = async () => {
    return await postAPI("/api/v1/incidencia/obtenerIncidenciasAsignadas")
}

export const obtenerIncidenciasSinAsignar = async () => {
    return await postAPI("/api/v1/incidencia/obtenerIncidenciasSinAsignar")
}

export const solucionarIncidencia = async () => {
    return await postAPI("/api/v1/incidencia/solucionarIncidencia")
}

export const asignarmeIncidencia = async (id) => {
    return await postAPI("/api/v1/incidencia/asignarmeIncidencia",(id))
}