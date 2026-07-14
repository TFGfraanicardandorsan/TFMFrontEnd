import { getArchivo, getPDF, postAPI } from "../lib/methodAPIs.js";

export const subidaArchivo = async (formData) => {
    return await postAPI("/api/v1/upload",formData,true)
}

export const servirArchivo = async (tipo,fileId) => {
    return await getPDF(`/api/v1/uploads/${tipo}/${fileId}`)
}

export const servirArchivoConTipo = async (tipo, fileId) => {
    return await getArchivo(`/api/v1/uploads/${tipo}/${fileId}`)
}

export const obtenerPlantillaPermuta = async () => {
    return await getPDF("/api/v1/plantillaPermuta")
}
