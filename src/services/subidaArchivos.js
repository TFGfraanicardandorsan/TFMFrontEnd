import { postAPI}  from "../lib/methodAPIs.js";
import { getAPI}  from "../lib/methodAPIs.js";

export const subidaArchivo = async (formData) => {
    return await postAPI("/api/v1/upload",formData,true)
}

export const obtenerPlantillaPermuta = async () => {
    return await getAPI("/api/v1/plantillaPermuta")
}