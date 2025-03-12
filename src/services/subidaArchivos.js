import { postAPI}  from "../lib/methodAPIs.js";

export const subidaArchivo = async (formData) => {
    return await postAPI("/api/v1/upload",formData,true)
}