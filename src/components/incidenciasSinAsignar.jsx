import { useEffect, useState } from "react";
import "../styles/misIncidencias-style.css";
import { useNavigate } from "react-router-dom";
import { obtenerIncidenciasSinAsignar, asignarmeIncidencia } from "../services/incidencia";
import { formatearFecha } from "../lib/formateadorFechas.js";
import { toast } from "react-toastify";
import { logError } from "../lib/logger.js";

export default function IncidenciasSinAsignar() {
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
                setError("Hubo un problema al cargar las incidencias. Por favor, inténtalo de nuevo más tarde.");
                logError(error);
            } finally {
                setCargando(false);
            }
        };
        cargarIncidencias();
    }, []);

    const handleAsignarIncidencia = async (idIncidencia) => {
        try {
            const response = await asignarmeIncidencia(idIncidencia);
            if (!response.err) {
                setIncidencias(incidencias.filter((incidencia) => incidencia.id !== idIncidencia));
                toast.success("Incidencia asignada correctamente.");
            } else {
                throw new Error(response.errmsg);
            }
        } catch (error) {
            toast.error("Hubo un problema al asignar la incidencia.");
            logError(error);
        }
    };

    return (
        <>
            <div className="container" style={{ display: "flow", paddingBottom: "40px" }}>
                <div className="header">
                    <h1>Todas las Incidencias Sin Asignar</h1>
                    <p>Consulta todas las incidencias sin asignar. Puedes asignarte una incidencia haciendo clic en el botón correspondiente.</p>
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
                                <p><strong>Estado:</strong> {incidencia.estado_incidencia}</p>
                                <p><strong>Fecha de creación:</strong> {formatearFecha(incidencia.fecha_creacion)}</p>
                                <p><strong>Tipo de Incidencia:</strong> {incidencia.tipo_incidencia}</p>
                                <p><strong>Descripción:</strong> {incidencia.descripcion}</p>
                                <button className="asignar-btn" onClick={() => handleAsignarIncidencia(incidencia.id)}>
                                    Asignarme Incidencia
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div style={{ height: "80px" }} /> {/* Espacio para el footer */}
        </>
    );
}
