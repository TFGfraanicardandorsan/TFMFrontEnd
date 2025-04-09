import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 👈 Importamos useNavigate
import Footer from "./footer";
import Navbar from "./navbar";
import "../styles/home-style.css";
import { obtenerNotificaciones } from "../services/notificacion.js";

const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

export default function Home() {
    const [notificaciones, setNotificaciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const cargarNotificaciones = async () => {
            try {
                const data = await obtenerNotificaciones();
                if (Array.isArray(data.result.result)) {
                    setNotificaciones(data.result.result);
                } else {
                    console.error("La respuesta no es un arreglo", data);
                    setNotificaciones([]);
                }
            } catch (error) {
                console.error("Error al obtener las notificaciones:", error);
            } finally {
                setCargando(false);
            }
        };
        cargarNotificaciones();
    }, []);

    if (cargando) {
        return <div className="loading-text">Cargando...</div>;
    }

    return (
        <div className="home-container">
            <Navbar />
            <div className="content">
                <h1 style={{ color: 'red' }}>Bienvenido a Permutas ETSII</h1>
                <p>Una plataforma para gestionar permutas de manera eficiente.</p>
                <button 
                    className="explore-button"
                    onClick={() => navigate("/login")}
                >
                    Iniciar Sesión
                </button>

                <div className="notificaciones">
                    <h2>Últimas Notificaciones</h2>
                    <div className="notificaciones-cards">
                        {notificaciones.map((notificacion) => (
                            <div className="notificacion-card" key={notificacion.id}>
                                <div className="notificacion-contenido">
                                    <h3>{notificacion.contenido}</h3>
                                    <p>{formatearFecha(notificacion.fecha_creacion)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <br /><br /><br />
            <Footer />
        </div>
    );
}
