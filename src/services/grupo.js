import { postAPI}  from "../lib/methodAPIs.js";

export const obtenerTodosGruposMisAsignaturasUsuario = async () => {
    return await postAPI("/api/v1/grupo/obtenerTodosGruposMisAsignaturasUsuario")
}

export const obtenerMiGrupoAsignatura = async () => {
    return await postAPI("/api/v1/grupo/obtenerMiGrupoAsignatura")
}

export const insertarMisGrupos = async (paramNumGrupo,paramCodigo) => {
    return await postAPI("/api/v1/grupo/insertarMisGrupos", {num_grupo:paramNumGrupo,codigo:paramCodigo})
}

export const obtenerTodosGruposMisAsignaturasSinGrupoUsuario = async () => {
    return await postAPI("/api/v1/grupo/obtenerTodosGruposMisAsignaturasSinGrupoUsuario")
}

export const crearGrupoAsignatura = async (codigo) => {
    return await postAPI("/api/v1/grupo/crearGrupoAsignatura", { codigo })
}

export const crearGruposCursoGrado = async (estudiosId, curso) => {
    return await postAPI("/api/v1/grupo/crearGruposCursoGrado", { estudiosId, curso })
}

export const eliminarUltimoGrupoAsignatura = async (codigo) => {
    return await postAPI("/api/v1/grupo/eliminarUltimoGrupoAsignatura", { codigo })
}

export const eliminarUltimosGruposAsignaturas = async (codigos) => {
    return await postAPI("/api/v1/grupo/eliminarUltimosGruposAsignaturas", { codigos })
}

export const eliminarUltimosGruposCursoGrado = async (estudiosId, curso) => {
    return await postAPI("/api/v1/grupo/eliminarUltimosGruposCursoGrado", { estudiosId, curso })
}
