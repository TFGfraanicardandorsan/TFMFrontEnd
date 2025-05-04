import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";

export default function RedirectHome() {
  const { isAuthenticated, user } = useAuth();
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.rol === "administrador") {
        setRedirect("/admin");
      } else if (user?.rol === "estudiante") {
        setRedirect("/estudiante");
      }
    }
  }, [isAuthenticated, user]);

  if (redirect) {
    return <Navigate to={redirect} replace />;
  }
  return null;
}
