import { useEffect, useState } from "react";
import AuthContext from "./AuthContext.jsx";
import PropTypes from "prop-types";
import { obtenerSesion } from "../services/login.js";

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({ loading: true, isAuthenticated: false, user: null });

    useEffect(() => {
        const handleAuthFailure = () => {
            setAuth({ loading: false, isAuthenticated: false, user: null });
        };

        window.addEventListener('auth-failure', handleAuthFailure);

        const apiObtenerSesion = async () => {
            try {
                const data = await obtenerSesion();
                // Data ya viene del result de getAPI si se usa la estructura {err, result}
                // Pero parece que obtenerSesion() devuelve directamente el data en AuthProvider
                // Vamos a asegurarnos de manejar correctamente si viene envuelto o no.
                const authData = data?.result || data;
                setAuth({
                    loading: false,
                    isAuthenticated: authData?.isAuthenticated === true,
                    user: authData?.user || null
                });
            } catch (error) {
                setAuth({ loading: false, isAuthenticated: false, user: null });
            }
        };
        apiObtenerSesion();

        return () => {
            window.removeEventListener('auth-failure', handleAuthFailure);
        };
    }, []);

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
AuthProvider.propTypes = { children: PropTypes.node.isRequired };
