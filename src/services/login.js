import { getAPI}  from "../lib/methodAPIs.js";

export const login = async () => {
    return await getAPI("/api/v1/autorizacion/saml/login")
}