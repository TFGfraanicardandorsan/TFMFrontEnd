import i18n from "../i18n";
import { csrfFetch } from "./csrf.js";

export const postAPI = async (fun, body = null, isFile = false) => {
    try {
        const config = {
            method: 'POST',
            credentials: 'include', // Para enviar cookies de sesión
        };

        if (body) {
            if (isFile) {
                config.body = body; // Enviar `FormData` directamente
            } else {
                config.headers = { 'Content-Type': 'application/json' };
                config.body = JSON.stringify(body);
            }
        }

        const respuesta = await csrfFetch(import.meta.env.VITE_API_URL + fun, config);

        if (!respuesta.ok) {
            let errorMessage = `Error ${respuesta.status}: ${respuesta.statusText}`;
            try {
                const errorData = await respuesta.json();
                errorMessage = errorData.message || errorData.errmsg || errorData.error || errorMessage;
            } catch {
                // La respuesta de error no siempre incluye JSON.
            }
            throw new Error(errorMessage);
        }

        let data;
        try {
            data = await respuesta.json();
        } catch {
            return { err: true, errmsg: i18n.t("api.invalid_json") };
        }

        return { err: false, result: data };
    } catch (e) {
        return { err: true, errmsg: i18n.t("api.post_exception", { message: e.message }) };
    }
};

export const getAPI = async (fun) => {
    let data;
    try {
        const respuesta = await fetch(import.meta.env.VITE_API_URL + fun, {
            method: 'get',
            credentials: 'include',
        })
        // Verificar si la respuesta es una redirección
        if (respuesta.redirected) {
            window.location.href = respuesta.url
            return;
        }
        // Verificar si la respuesta es un JSON
        const contentType = respuesta.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await respuesta.json();
        } else {
            data = { err: true, errmsg: `${i18n.t("api.not_json")}: ${respuesta}`, respuestaText: await respuesta.text(), }
        }
    } catch (e) {
        data = { err: true, errmsg: i18n.t("api.get_exception", { message: e.message || e }), }
    }
    return data
}

export const getPDF = async (fun) => {
    const respuesta = await fetch(import.meta.env.VITE_API_URL + fun, {
        method: 'get',
        credentials: 'include',
    });
    if (!respuesta.ok) throw new Error(i18n.t("api.pdf_error"));
    return await respuesta.arrayBuffer();
}
