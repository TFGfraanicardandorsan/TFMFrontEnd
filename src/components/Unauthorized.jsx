import { Link } from 'react-router-dom';
import Navbar from './navbar';
import Footer from './footer';

export default function Unauthorized() {
    return (
        <>
        <Navbar/>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>401 - Acceso denegado</h1>
            <p> No tienes permisos para ver esta página.</p>
            <Link to="/">Volver a la página principal</Link>
        </div>
        <Footer/>
        </>

    );
};