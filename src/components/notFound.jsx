import { Link } from 'react-router-dom';
import Navbar from './navbar';
import Footer from './footer';

const NotFound = () => {
    return (
        <>
        <Navbar/>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>404 - Página No Encontrada</h1>
            <p>Lo sentimos, la página que estás buscando no existe.</p>
            <Link to="/">Volver a la página principal</Link>
        </div>
        <Footer/>
        </>

    );
};

export default NotFound;