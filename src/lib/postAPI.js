export async function postapi(fun,body) {
    let data;
    try{
        const respuesta = await fetch(import.meta.env.VITE_API_URL + fun, {
            method: 'post',
            body: JSON.stringify(body),
            headers: {'Content-Type': 'application/json'},
        })
        data = await respuesta.json();
    }
    catch(e){
        data = {err:true, errmsg: `excepción al hacer el método postApi: ${e}`,}
    }
    return data
}