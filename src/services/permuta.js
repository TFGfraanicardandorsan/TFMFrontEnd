import { postAPI}  from "../lib/methodAPIs.js";

export const solicitarPermuta = async (paramNumGrupo,paramCodigo) => {
    return await postAPI("/api/v1/solicitudPermuta/solicitarPermuta", {asignatura:paramNumGrupo,grupos_deseados:paramCodigo})
}
export const obtenerSolicitudesPermuta = async () => {
    return await postAPI("/api/v1/solicitudPermuta/getMisSolicitudesPermuta")
}

export const obtenerPermutasInteresantes = async () => {
    return await postAPI("/api/v1/solicitudPermuta/getSolicitudesPermutaInteresantes");
}

export const verListaPermutas = async () => {
    return await postAPI("/api/v1/solicitudPermuta/verListaPermutas");
}

// export const aceptarPermuta = async (solicitudId) => {
//     return await postAPI("/api/v1/solicitudPermuta/aceptarPermuta", {
//         solicitud_id: solicitudId
//     });
// }

export const validarPermuta = async (solicitudId) => {
    return await postAPI("/api/v1/solicitudPermuta/validarSolicitudPermuta", {
        solicitud_id: solicitudId
    });
}

export const denegarPermuta = async (solicitudId) => {
    return await postAPI("/api/v1/solicitudPermuta/rechazarSolicitudPermuta", {
        solicitud_id: solicitudId
    });
}

export const listarPermutas = async () => {
    return await postAPI("/api/v1/permutas/listarPermutas");
}

export const crearListaPermutas = async (archivo,IdsPermuta) => {
    return await postAPI("/api/v1/permutas/crearListaPermutas", {archivo,IdsPermuta})
}