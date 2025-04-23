import { postAPI}  from "../lib/methodAPIs.js";
import { getPDF }  from "../lib/methodAPIs.js";

export const subidaArchivo = async (formData) => {
    return await postAPI("/api/v1/upload",formData,true)
}

export const obtenerPlantillaPermuta = async () => {
    return await getPDF("/api/v1/plantillaPermuta")
}