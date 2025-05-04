import { useEffect, useState } from "react";
import "../styles/misIncidencias-style.css";
import { useNavigate } from "react-router-dom";
import { obtenerIncidencias } from "../services/incidencia";

export default function MisIncidencias() {
    const navigate = useNavigate();
    const [incidencias, setIncidencias] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarIncidencias = async () => {
            try {
                const data = await obtenerIncidencias();
                setIncidencias(data);
            } catch (error) {
                console.error("Error al obtener las incidencias:", error);
            } finally {
                setCargando(false);
            }
        };
        cargarIncidencias();
    }, []);

    return (
        <>
            <div className="container">
                <div className="header">
                    <h1>Todas las Incidencias</h1>
                </div>

                {cargando ? (
                    <p className="loading-message">Cargando incidencias...</p>
                ) : incidencias.length === 0 ? (
                    <div className="no-incidencias">
                        <p>No tienes incidencias abiertas.</p>
                    </div>
                ) : (
                    <div className="incidencias-container">
                        {incidencias.map((incidencia) => (
                            <div key={incidencia.id} className="incidencia-card">
                                <p><strong>Incidencia:</strong> {incidencia.id}</p>
                                <p><strong>Tipo de Incidencia:</strong> {incidencia.tipo}</p>
                                <p><strong>Estado:</strong> {incidencia.estado}</p>
                                <p><strong>Comentario:</strong> {incidencia.comentario}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
