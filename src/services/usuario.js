import { postAPI}  from "../lib/methodAPIs.js";

export const obtenerDatosUsuario = async () => {
    return await postAPI("/api/v1/usuario/obtenerDatosUsuario")
}

export const actualizarEstudiosUsuario = async () => {
    return await postAPI("/api/v1/usuario/actualizarEstudiosUsuario")
}