import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

export default function RedirectHome() {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.rol === "administrador") {
        window.location.replace("/admin");  
      } else if (user?.rol === "estudiante") {
        window.location.replace("/estudiante");  
      }
    }
  }, [isAuthenticated, user]);

  return null; 
};
