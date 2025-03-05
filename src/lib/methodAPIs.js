export const postAPI = async (fun, body) => {
    try {
        const respuesta = await fetch(import.meta.env.VITE_API_URL + fun, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Para enviar cookies de sesión
        });
 
        // Verificar si la respuesta es exitosa
        if (!respuesta.ok) {
            throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
        }
        // Intentar parsear la respuesta JSON, si existe
        let data;
        try {
            data = await respuesta.json();
        } catch {
            data = null;
        }
        return { err: false, result: data };
    } catch (e) {
        return {err: true, errmsg: `Excepción en postAPI: ${e.message}`,
        };
    }
};

export const getAPI = async (fun) => {
    let data;
    try{
        const respuesta = await fetch(import.meta.env.VITE_API_URL + fun, {
            method: 'get',
        })
        // Verificar si la respuesta es una redirección
        if(respuesta.redirected){
            window.location.href = respuesta.url
            return;
        }
        // Verificar si la respuesta es un JSON
        const contentType = respuesta.headers.get('content-type');
        if(contentType && contentType.includes('application/json')){
            data = await respuesta.json();
        }else{
            data = {err:true, errmsg: `La respuesta no es un JSON: ${respuesta}`, respuestaText: await respuesta.text(),}
        }
    }catch(e){
        data = {err:true, errmsg: `Excepción al hacer el método getAPI: ${e}`,}
    }
    return data
}