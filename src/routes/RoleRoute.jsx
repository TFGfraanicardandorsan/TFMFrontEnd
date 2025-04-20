import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import PropTypes from "prop-types";

RoleRoute.propTypes = { children: PropTypes.node.isRequired,allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired };

export const RoleRoute = ({ children, allowedRoles }) => {
  const { loading, isAuthenticated, user } = useAuth();
  if (loading) return <div>Cargando...</div>;
  if (!isAuthenticated || !allowedRoles.includes(user?.rol)) return <Navigate to="/unauthorized" replace />;
  return children;
};
