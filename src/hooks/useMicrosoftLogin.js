import { PublicClientApplication,EventType} from "@azure/msal-browser";
import { useCallback, useEffect, useMemo, useState } from "react";
  
  // Configuración de MSAL
  const msalConfig = {
    auth: {
      clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
    },
  };
  
  // Configuración para las solicitudes de login y token
  const loginRequest = {
    scopes: ["User.Read"],
    redirectUri:"/"
  };
  
  // Hook personalizado
  const useMicrosoftLogin = () => {
    const [initialized, setInitialized] = useState(false);
    const [activeAccount, setActiveAccount] = useState(null); // Para almacenar el usuario activo
    const [accessToken, setAccessToken] = useState(null); // Para almacenar el token de acceso
  
    // Crear instancia de MSAL
    const msalInstance = useMemo(() => {
      return new PublicClientApplication(msalConfig);
    }, []);
  
    // Inicializar MSAL y gestionar eventos
    const initializeInstance = useCallback(() => {
      msalInstance.addEventCallback((event) => {
        if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
          const payload = event.payload
          const account = payload.account;
          msalInstance.setActiveAccount(account);
          setActiveAccount(account);
        }
      });
      setInitialized(true);
    }, [msalInstance]);
  
    // Obtener token de acceso
    const acquireAccessToken = useCallback(async () => {
      try {
        const account = msalInstance.getActiveAccount();
        if (!account) {
          throw new Error("No hay una cuenta activa. Inicia sesión primero.");
        }
  
        const tokenResponse = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account,
        });
        setAccessToken(tokenResponse.accessToken);
        return tokenResponse.accessToken;
      } catch (error) {
        console.error("Error obteniendo el token de acceso:", error);
        return null;
      }
    }, [msalInstance]);
  
    useEffect(() => {
      initializeInstance();
    }, [initializeInstance]);
  
    return {
      msalInstance,
      initialized,
      activeAccount,
      accessToken,
      acquireAccessToken,
      loginRequest,
    };
  };
  
  export default useMicrosoftLogin;
  