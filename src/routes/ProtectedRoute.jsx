import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

export const ProtectedRoute = ({ children }) => {
    const { loading, isAuthenticated } = useAuth();
    const { t } = useTranslation();
    if (loading) return <div>{t("common.loading")}</div>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
};
ProtectedRoute.propTypes = { children: PropTypes.node.isRequired };
