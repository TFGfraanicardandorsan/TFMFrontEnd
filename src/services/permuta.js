import { postAPI}  from "../lib/methodAPIs.js";

export const solicitarPermuta = async (paramNumGrupo,paramCodigo) => {
    return await postAPI("/api/v1/solicitudPermuta/solicitarPermuta", {num_grupo:paramNumGrupo,codigo:paramCodigo})
}