import { postAPI}  from "../lib/methodAPIs.js";

export const obtenerAsignaturasEstudio = async () => {
    return await postAPI("/api/v1/asignatura/obtenerAsignaturasMiEstudioUsuario")
}