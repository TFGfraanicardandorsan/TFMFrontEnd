import { useState, useEffect } from "react";
import "../../../styles/solicitudesPermuta-style.css";
import { obtenerSolicitudesPermuta } from "../../services/permuta";
import { toast } from "react-toastify";
import { cancelarSolicitudPermuta } from "../../services/permuta";
export default function SolicitudesPermuta() {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState("todas");

    // Modal para ver detalles (sin botón cancelar dentro del modal)
    const [modalOpen, setModalOpen] = useState(false);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

    useEffect(() => {
        const fetchSolicitudes = async () => {
            try {
                const res = await obtenerSolicitudesPermuta();
                if (!res.err) {
                    // adapta según la estructura real de la respuesta
                    setSolicitudes(res.result?.result || []);
                } else {
                    throw new Error(res.errmsg || "Error al obtener solicitudes");
                }
            } catch (err) {
                setError(err.message || "Error al cargar solicitudes");
            } finally {
                setLoading(false);
            }
        };
        fetchSolicitudes();
    }, []);

    const handleCancelar = async (solicitud_id) => {
        try {
            const res = await cancelarSolicitudPermuta(solicitud_id);
            if (!res.err) {
                // eliminar la solicitud cancelada de la lista local
                setSolicitudes(prev => prev.filter(s => s.solicitud_id !== solicitud_id));
                toast.success("Solicitud cancelada correctamente");
                // si el modal muestra esa solicitud, ciérralo
                if (solicitudSeleccionada?.solicitud_id === solicitud_id) {
                    setModalOpen(false);
                    setSolicitudSeleccionada(null);
                }
            } else {
                toast.error(res.errmsg || "No se pudo cancelar la solicitud");
            }
        } catch (err) {
            toast.error("Error al cancelar la solicitud");
        }
    };

    const abrirModal = (solicitud) => {
        setSolicitudSeleccionada(solicitud);
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setSolicitudSeleccionada(null);
    };

    if (loading) return <div className="loading-text">Cargando solicitudes...</div>;
    if (error) return <div className="error-text">Error: {error}</div>;

    const solicitudesFiltradas =
        filtroEstado === "todas"
            ? solicitudes
            : solicitudes.filter((solicitud) => solicitud.estado === filtroEstado);

    return (
        <div className="page-container">
            <div className="content-wrap">
                <div className="solicitudes-container">
                    <h1 className="solicitudes-title">Mis Solicitudes de Permuta</h1>
                    <p className="solicitudes-description">
                        Aquí puedes ver todas tus solicitudes de permuta. Filtra por estado o abre una solicitud para ver detalles.
                    </p>

                    <div className="filtro-container">
                        <label htmlFor="filtroEstado">Filtrar por estado:</label>
                        <select
                            id="filtroEstado"
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                        >
                            <option value="todas">Todas</option>
                            <option value="SOLICITADA">Solicitadas</option>
                            <option value="EMPAREJADA">Emparejadas</option>
                            <option value="ACEPTADA">Aceptadas</option>
                            <option value="RECHAZADA">Rechazadas</option>
                            <option value="CANCELADA">Canceladas</option>
                        </select>
                    </div>

                    <div className="solicitudes-content">
                        {solicitudesFiltradas.length > 0 ? (
                            solicitudesFiltradas.map((solicitud) => (
                                <div key={solicitud.solicitud_id} className="solicitud-card">
                                    <p>
                                        <strong>Asignatura:</strong> {solicitud.nombre_asignatura} ({solicitud.codigo_asignatura})
                                        <br />
                                        <strong>Grupo Actual:</strong> {solicitud.grupo_solicitante}
                                    </p>
                                    <p>
                                        <strong>Grupos Deseados:</strong> {Array.isArray(solicitud.grupos_deseados) ? solicitud.grupos_deseados.join(", ") : solicitud.grupos_deseados}
                                    </p>
                                    <p><strong>Estado:</strong> {solicitud.estado}</p>

                                    <div className="solicitud-actions">
                                        <button className="detalles-btn" onClick={() => abrirModal(solicitud)}>
                                            Ver detalles
                                        </button>

                                        {/* Botón cancelar mostrado sólo en la lista y sólo si está en SOLICITADA */}
                                        {solicitud.estado === "SOLICITADA" && (
                                            <button
                                                className="cancelar-btn"
                                                onClick={() => handleCancelar(solicitud.solicitud_id)}
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No tienes solicitudes de permuta registradas.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de detalles - sin botón de cancelar dentro del modal */}
            {modalOpen && solicitudSeleccionada && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Detalles de la Solicitud</h2>
                        <p><strong>Asignatura:</strong> {solicitudSeleccionada.nombre_asignatura} ({solicitudSeleccionada.codigo_asignatura})</p>
                        <p><strong>Grupo Actual:</strong> {solicitudSeleccionada.grupo_solicitante}</p>
                        <p><strong>Grupos Deseados:</strong> {Array.isArray(solicitudSeleccionada.grupos_deseados) ? solicitudSeleccionada.grupos_deseados.join(", ") : solicitudSeleccionada.grupos_deseados}</p>
                        <p><strong>Estado:</strong> {solicitudSeleccionada.estado}</p>
                        <p><strong>Descripción:</strong> {solicitudSeleccionada.descripcion || "—"}</p>

                        <div className="modal-actions">
                            <button onClick={cerrarModal}>Cerrar</button>
                            {/* Nota: no se incluye botón cancelar aquí por requerimiento */}
                        </div>
                    </div>
                </div>
            )}

            <div style={{ height: "80px" }} /> {/* espacio para el footer */}
        </div>
    );
}