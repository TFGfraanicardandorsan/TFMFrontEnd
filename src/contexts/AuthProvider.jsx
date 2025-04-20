import { useEffect, useState } from "react";
import AuthContext from "./AuthContext.jsx";
import PropTypes from "prop-types";
import { obtenerSesion } from "../services/login.js";

AuthProvider.propTypes = { children: PropTypes.node.isRequired };

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ loading: true,isAuthenticated: false,user: null });

  useEffect(() => {
    const apiObtenerSesion = async () => {
      try {
        const data = await obtenerSesion();
        setAuth({ loading: false,isAuthenticated: data.isAuthenticated,user: data.user });
      } catch (error) {
        console.error("Error al obtener la sesión:", error);
        setAuth({ loading: false,isAuthenticated: false,user: null });
      }
    };
    apiObtenerSesion();
  }, []);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};