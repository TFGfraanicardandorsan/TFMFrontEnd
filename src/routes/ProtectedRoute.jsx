import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import PropTypes from "prop-types";

export const ProtectedRoute = ({ children }) => {
    const { loading, isAuthenticated } = useAuth();
    if (loading) return <div>Cargando...</div>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
};
ProtectedRoute.propTypes = { children: PropTypes.node.isRequired };
