import { login } from "../services/login";
import Footer from "./footer";
import '../styles/login-style.css';

export default function Login() {
    // const navigate = useNavigate();

    // const handleLoginSuccess = useCallback(async (jwt) => {
    //     const response = await login ({idtoken:jwt});
    //     if(response?.sesionid) {
    //         localStorage.setItem('sesionid', response.sesionid),
    //         localStorage.setItem('mmtCreacion', response.mmtCreacion);

    //         // Redireccionar a la página inicio TODO
    //         navigate('/');
    //     }
    // },[navigate]);

    const handleClickLogin = async() => {
        await login()
    };

    return (
        <>
<div className="app-container">
            <div className="content">
                <div className="logo-container">
                    <img src="/assets/logo-etsii-color.png" alt="Logo ETSII" />
                </div>
                <div style={{display:'flex', flexDirection:'column', alignItems:'center', padding:'20px'}}>
                    <h1 style={{color:'red'}}>Inicio sesión en Permutas ETSII</h1>
                    <button 
                        onClick={handleClickLogin} 
                        style={{
                            padding: '20px 40px',  /* Aumenta el espacio dentro del botón */
                            marginTop: '20px', 
                            fontSize: '28px',  /* Hace el texto más grande */
                            backgroundColor: 'red', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px',  /* Bordes más redondeados */
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',  /* Espacio entre el texto y el icono */
                            cursor: 'pointer',  /* Cambia el cursor a una mano al pasar sobre el botón */
                            fontWeight: 'bold'
                        }}>
                        🔒 Inicia Sesión
                    </button>
                </div>
            </div>
            <Footer/>
        </div>
        </>
    )
}