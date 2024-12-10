import { PublicClientApplication,EventType} from "@azure/msal-browser";
import { useCallback, useEffect, useMemo, useState } from "react";
  
  // Configuración de MSAL
  const msalConfig = {
    auth: {
      clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID}`,
      redirectUri:"/"

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
  
    // Crear instancia de MSAL
    const msalInstance = useMemo(() => {
      return new PublicClientApplication(msalConfig);
    }, []);
  
    // Inicializar MSAL y gestionar eventos
    const initializeInstance = useCallback(async () => {
      msalInstance.addEventCallback((event) => {
        if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
          const payload = event.payload
          const account = payload.account;
          msalInstance.setActiveAccount(account);
        }
      });
      await msalInstance.initialize();
      setInitialized(true);
    }, [msalInstance]);
  
    useEffect(() => {
      initializeInstance();
    }, [initializeInstance]);
  
    return {msalInstance, initialized,loginRequest};
  };
  
  export default useMicrosoftLogin;
  