import { postAPI}  from "../lib/methodAPIs.js";

export const solicitarPermuta = async (paramNumGrupo,paramCodigo) => {
    return await postAPI("/api/v1/solicitudPermuta/solicitarPermuta", {asignatura:paramNumGrupo,grupos_deseados:paramCodigo})
}
export const obtenerSolicitudesPermuta = async () => {
    return await postAPI("/api/v1/solicitudPermuta/getMisSolicitudesPermuta")
}