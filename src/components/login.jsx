import { login } from "../services/login";

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
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', padding:'20px'}}>
            <h1 style={{color:'red'}}>Inicio sesión en Permutas ETSII</h1>
            <button onClick={handleClickLogin} style={{padding:'10px 20px', marginTop:'20px', backgroundColor:'red', color:'white', border:'none', borderRadius:'5px'}}>
                Inicia Sesión
            </button>
        </div>
        </>
    )
}