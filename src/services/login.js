import { getAPI}  from "../lib/methodAPIs.js";

export const login = async () => {
    return await getAPI("/api/v1/autorizacion/saml/login")
}

export const logout = async () => {
    return await getAPI("/api/v1/autorizacion/saml/logout")
}

export const obtenerSesion = async () => {
    return await getAPI("/api/v1/autorizacion/obtenerSesion")
}