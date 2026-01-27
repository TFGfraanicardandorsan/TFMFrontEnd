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

        const respuesta = await fetch(import.meta.env.VITE_API_URL + fun, config);

        if (respuesta.status === 401) {
            window.dispatchEvent(new Event('auth-failure'));
            throw new Error(`Error 401: No autorizado`);
        }

        if (!respuesta.ok) {
            throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
        }

        let data;
        try {
            data = await respuesta.json();
            // Si la respuesta indica explícitamente que no está autenticado
            if (data.isAuthenticated === false) {
                window.dispatchEvent(new Event('auth-failure'));
            }
        } catch {
            return { err: true, errmsg: 'La respuesta no es un JSON válido' };
        }

        return { err: false, result: data };
    } catch (e) {
        return { err: true, errmsg: `Excepción en postAPI: ${e.message}` };
    }
};

export const getAPI = async (fun) => {
    let data;
    try {
        const respuesta = await fetch(import.meta.env.VITE_API_URL + fun, {
            method: 'get',
            credentials: 'include',
        })

        if (respuesta.status === 401) {
            window.dispatchEvent(new Event('auth-failure'));
            return { err: true, errmsg: 'No autorizado' };
        }

        // Verificar si la respuesta es una redirección
        if (respuesta.redirected) {
            window.location.href = respuesta.url
            return;
        }
        // Verificar si la respuesta es un JSON
        const contentType = respuesta.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await respuesta.json();
            if (data.isAuthenticated === false) {
                window.dispatchEvent(new Event('auth-failure'));
            }
        } else {
            data = { err: true, errmsg: `La respuesta no es un JSON: ${respuesta}`, respuestaText: await respuesta.text(), }
        }
    } catch (e) {
        data = { err: true, errmsg: `Excepción al hacer el método getAPI: ${e}`, }
    }
    return data
}

export const getPDF = async (fun) => {
    const respuesta = await fetch(import.meta.env.VITE_API_URL + fun, {
        method: 'get',
        credentials: 'include',
    });
    if (!respuesta.ok) throw new Error("No se pudo obtener el PDF");
    return await respuesta.arrayBuffer();
}
