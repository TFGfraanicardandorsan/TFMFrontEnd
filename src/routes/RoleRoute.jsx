import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import PropTypes from "prop-types";
import { isAllowedRole } from "../lib/roles.js";
import { useTranslation } from "react-i18next";

export const RoleRoute = ({ children, allowedRoles }) => {
  const { loading, isAuthenticated, user } = useAuth();
  const { t } = useTranslation();
  if (loading) return <div>{t("common.loading")}</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAllowedRole(user?.rol, allowedRoles)) return <Navigate to="/unauthorized" replace />;
  return children;
};
RoleRoute.propTypes = { children: PropTypes.node.isRequired,allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired };
