import { postAPI}  from "../lib/methodAPIs.js";

export const obtenerTodosGruposMisAsignaturasUsuario = async () => {
    return await postAPI("/api/v1/grupo/obtenerTodosGruposMisAsignaturasUsuario")
}