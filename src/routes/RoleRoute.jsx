import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import PropTypes from "prop-types";

export const RoleRoute = ({ children, allowedRoles }) => {
  const { loading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    if (!allowedRoles.includes(user?.rol)) {
      return <Navigate to="/unauthorized" replace />;
    }
    if (user?.rol === "administrador") {
      navigate("/admin");
    } else if (user?.rol === "estudiante") {
      navigate("/estudiante");
    }
  }, [loading, isAuthenticated, user, allowedRoles, navigate]);

  if (loading) return <div>Cargando...</div>;

  return children;
};

RoleRoute.propTypes = { children: PropTypes.node.isRequired,allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired };
