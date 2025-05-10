import { useEffect, useState } from "react";
import "../styles/misIncidencias-style.css";
import { useNavigate } from "react-router-dom";
import { obtenerIncidenciasSinAsignar, asignarmeIncidencia } from "../services/incidencia";

export default function MisIncidencias() {
    const navigate = useNavigate();
    const [incidencias, setIncidencias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarIncidencias = async () => {
            try {
                const data = await obtenerIncidenciasSinAsignar();
                setIncidencias(data.result.result);
            } catch (error) {
                console.error("Error al obtener las incidencias:", error);
                setError("Hubo un problema al cargar las incidencias. Por favor, inténtalo de nuevo más tarde.");
            } finally {
                setCargando(false);
            }
        };
        cargarIncidencias();
    }, []);

    const handleAsignarIncidencia = async (idIncidencia) => {
        try {
            console.log("Asignando incidencia con ID:", idIncidencia);
            const response = await asignarmeIncidencia(idIncidencia);
            if (!response.err) {
                // Actualizar la lista de incidencias eliminando la asignada
                setIncidencias(incidencias.filter((incidencia) => incidencia.id !== idIncidencia));
                alert("Incidencia asignada correctamente.");
            } else {
                throw new Error(response.errmsg);
            }
        } catch (error) {
            console.error("Error al asignar la incidencia:", error);
            alert("Hubo un problema al asignar la incidencia.");
        }
    };

    return (
        <>
            <div className="container" style={{ display: "flow", paddingBottom: "40px" }}>
                <div className="header">
                    <h1>Todas las Incidencias Sin Asignar</h1>
                </div>

                {cargando ? (
                    <p className="loading-message">Cargando incidencias...</p>
                ) : error ? (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={() => navigate("/")}>Volver al inicio</button>
                    </div>
                ) : incidencias.length === 0 ? (
                    <div className="no-incidencias">
                        <p>No hay incidencias sin asignar.</p>
                    </div>
                ) : (
                    <div className="incidencias-container">
                        {incidencias.map((incidencia) => (
                            <div key={incidencia.id} className="incidencia-card">
                                <p><strong>Tipo de Incidencia:</strong> {incidencia.descripcion}</p>
                                <p><strong>Estado:</strong> {incidencia.estado_incidencia}</p>
                                <p><strong>Comentario:</strong> {incidencia.tipo_incidencia}</p>
                                <button
                                    className="asignar-btn"
                                    onClick={() => handleAsignarIncidencia(incidencia.id)}
                                >
                                    Asignarme Incidencia
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
