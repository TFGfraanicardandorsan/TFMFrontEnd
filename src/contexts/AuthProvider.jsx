import { useEffect, useState } from "react";
import AuthContext from "./AuthContext.jsx";
import PropTypes from "prop-types";
import { obtenerSesion } from "../services/login.js";

// const comprobarSiHayCookies = document.cookie.includes("connect.sid");

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({ loading: true,isAuthenticated: false,user: null });
    
    useEffect(() => {
        const apiObtenerSesion = async () => {
            // if (!comprobarSiHayCookies) {
            //     setAuth({ loading: false, isAuthenticated: false, user: null });
            //     return;
            // }
            try {
                const data = await obtenerSesion();
                setAuth({ loading: false,isAuthenticated: data.isAuthenticated,user: data.user });
            } catch (error) {
                if (error.response?.status === 401) {
                  setAuth({ loading: false, isAuthenticated: false, user: null });
                }
            }
        };
        apiObtenerSesion();
    }, []);
    
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
AuthProvider.propTypes = { children: PropTypes.node.isRequired };
