import { postAPI}  from "../lib/postAPI";


export const checkAuth = async () => {
    const sesionid = localStorage.getItem('sesionid');
    const mmtCreacion = localStorage.getItem('mmtCreacion');
    return { sesionid, mmtCreacion}
}

export const login = async (idtoken) => {
    return await postAPI("/apilogin/login",{idtoken})
}