import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useMicrosoftLogin from "../hooks/useMicrosoftLogin";
import { login } from "../services/login";

export default function Login() {
    const navigate = useNavigate();

    const handleLoginSuccess = useCallback(async (jwt) => {
        const response = await login ({idtoken:jwt});
        if(response?.sesionid) {
            localStorage.setItem('sesionid', response.sesionid),
            localStorage.setItem('mmtCreacion', response.mmtCreacion);

            // Redireccionar a la página inicio TODO
            navigate('/');
        }
    },[navigate]);

    const microsoftAuth = useMicrosoftLogin();

    const microsoftLoginCallback = useCallback((response) => {
        const {idToken} = response;
        handleLoginSuccess(idToken);
    }, [handleLoginSuccess]);

    const handleClickLogin = () => {
        microsoftAuth.msalInstance.loginPopup(microsoftAuth.loginRequest).then((res) =>{
            microsoftLoginCallback(res)
        });
    };

    return (
        <>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', padding:'20px'}}>
            <h1>Inicio de sesión</h1>
            <button onClick={handleClickLogin} style={{padding:'10px 20px', marginTop:'20px'}}>
                Continuar con Microsoft
            </button>
        </div>
        </>
    )
}