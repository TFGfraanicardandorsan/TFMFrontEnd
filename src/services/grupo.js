import { postAPI}  from "../lib/methodAPIs.js";

export const obtenerMiGrupoAsignatura = async () => {
    return await postAPI("/api/v1/grupo/obtenerMiGrupoAsignatura")
}