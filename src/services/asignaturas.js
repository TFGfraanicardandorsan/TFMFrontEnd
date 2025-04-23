import { postAPI}  from "../lib/methodAPIs.js";

export const obtenerAsignaturasEstudio = async () => {
    return await postAPI("/api/v1/asignatura/obtenerAsignaturasMiEstudioUsuario")
}

export const actualizarAsignaturasUsuario = async (paramAsignatura) => {
    return await postAPI("/api/v1/usuarioAsignatura/actualizarAsignaturasUsuario", {asignatura:paramAsignatura})
}

export const obtenerAsignaturasUsuario = async () => {
    return await postAPI("/api/v1/usuarioAsignatura/obtenerAsignaturasUsuario")
}   

export const superarAsignaturasUsuario = async (paramAsignatura) => {
    return await postAPI("/api/v1/usuarioAsignatura/superarAsignaturasUsuario", {asignatura:paramAsignatura})
}   