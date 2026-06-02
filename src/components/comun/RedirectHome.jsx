import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ADMIN_ROLE, STUDENT_ROLE, isAllowedRole, isDelegationRole } from "../../lib/roles";

export default function RedirectHome() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (isAllowedRole(user?.rol, [ADMIN_ROLE])) {
        navigate("/admin");  
      } else if (isAllowedRole(user?.rol, [STUDENT_ROLE])) {
        navigate("/estudiante");  
      } else if (isDelegationRole(user?.rol)) {
        navigate("/delegacion");
      }
    }
  }, [isAuthenticated, user, navigate]);

  return null;
};
