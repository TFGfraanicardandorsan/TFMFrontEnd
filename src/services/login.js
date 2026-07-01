import { getAPI, postAPI } from "../lib/methodAPIs.js";
import { clearCsrfToken } from "../lib/csrf.js";

export const login = async () => {
    return await getAPI("/api/v1/autorizacion/saml/login")
}

export const logout = async () => {
    const response = await postAPI("/api/v1/autorizacion/saml/logout");
    if (!response.err && response.result?.redirectUrl) {
        clearCsrfToken();
        window.location.href = response.result.redirectUrl;
    }
    return response;
}

export const obtenerSesion = async () => {
    return await getAPI("/api/v1/autorizacion/obtenerSesion")
}
