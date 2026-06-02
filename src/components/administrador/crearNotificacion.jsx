import { useState } from "react";
import { crearNotificacion } from "../../services/notificacion";
import "../../styles/admin-common.css";
import "../../styles/crearNotificacion.css";
import { toast } from "react-toastify";
import { logError } from "../../lib/logger";

export default function CrearNotificacion() {
    const [contenido, setContenido] = useState("");
    const [receptor, setReceptor] = useState("");
    const [enviando, setEnviando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!contenido || !receptor) {
            toast.warning("Por favor, completa todos los campos.");
            return;
        }

        setEnviando(true);
        try {
            await crearNotificacion(receptor, contenido);
            toast.success("Notificación enviada correctamente.");
            setContenido("");
            setReceptor("");
        } catch (error) {
            toast.error("Hubo un error al enviar la notificación.");
            logError(error);
        } finally {
            setEnviando(false);
        }
    };

    // Información del receptor seleccionado
    const getReceptorInfo = () => {
        switch (receptor) {
            case "all":
                return { icon: "👥", label: "Todos los usuarios", color: "primary" };
            case "estudiante":
                return { icon: "🎓", label: "Estudiantes", color: "secondary" };
            case "administrador":
                return { icon: "👔", label: "Administradores", color: "warning" };
            case "delegacion":
                return { icon: "📄", label: "Delegación", color: "success" };
            default:
                return null;
        }
    };

    const receptorInfo = getReceptorInfo();

    return (
        <>
            <div className="admin-page-container">
                <div className="admin-content-wrap">
                    {/* Header */}
                    <div className="admin-page-header">
                        <h1 className="admin-page-title">📢 Crear Notificación</h1>
                        <p className="admin-page-subtitle">
                            Envía una notificación al tipo de usuario seleccionado. Podrás generar una notificación
                            a estudiantes, administradores o todos los usuarios del sistema.
                        </p>
                    </div>

                    {/* Formulario */}
                    <div className="admin-grid" style={{ maxWidth: "800px", margin: "0 auto" }}>
                        <div className="admin-card">
                            <div className="admin-card-header">
                                <h2 className="admin-card-title">
                                    <span className="admin-card-icon">✉️</span>
                                    Nueva Notificación
                                </h2>
                                {receptorInfo && (
                                    <span className={`admin-badge admin-badge-${receptorInfo.color}`}>
                                        {receptorInfo.icon} {receptorInfo.label}
                                    </span>
                                )}
                            </div>
                            <div className="admin-card-body">
                                <form className="notificacion-form" onSubmit={handleSubmit}>
                                    <div className="admin-form-group">
                                        <label htmlFor="receptor" className="admin-label">
                                            Destinatarios
                                        </label>
                                        <select
                                            id="receptor"
                                            className="admin-select"
                                            value={receptor}
                                            onChange={(e) => setReceptor(e.target.value)}
                                            required
                                        >
                                            <option value="">Selecciona el receptor</option>
                                            <option value="all">👥 Todos los usuarios</option>
                                            <option value="estudiante">🎓 Estudiantes</option>
                                            <option value="administrador">👔 Administradores</option>
                                            <option value="delegacion">📄 Delegación</option>
                                        </select>
                                    </div>

                                    <div className="admin-form-group">
                                        <label htmlFor="contenido" className="admin-label">
                                            Contenido del mensaje
                                        </label>
                                        <textarea
                                            id="contenido"
                                            className="admin-textarea"
                                            value={contenido}
                                            onChange={(e) => setContenido(e.target.value)}
                                            placeholder="Escribe el contenido de la notificación..."
                                            required
                                            rows={6}
                                        />
                                        <small style={{ color: "var(--admin-text-muted)", fontSize: "0.9rem" }}>
                                            {contenido.length} caracteres
                                        </small>
                                    </div>

                                    <div className="admin-card-footer" style={{ marginTop: "var(--admin-spacing-lg)", paddingTop: 0, borderTop: "none" }}>
                                        <button
                                            type="button"
                                            className="admin-btn admin-btn-secondary"
                                            onClick={() => {
                                                setContenido("");
                                                setReceptor("");
                                            }}
                                            disabled={enviando}
                                        >
                                            🗑️ Limpiar
                                        </button>
                                        <button
                                            type="submit"
                                            className="admin-btn admin-btn-primary"
                                            disabled={enviando}
                                        >
                                            {enviando ? "Enviando..." : "📨 Enviar Notificación"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Card de Ayuda */}
                        <div className="admin-card admin-tips-card">
                            <div className="admin-card-body">
                                <h3 className="admin-tips-title">
                                    💡 Consejos
                                </h3>
                                <ul className="admin-tips-list">
                                    <li>Sé claro y conciso en el mensaje</li>
                                    <li>Incluye información relevante para los destinatarios</li>
                                    <li>Revisa el contenido antes de enviar</li>
                                    <li>Las notificaciones se envían inmediatamente</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
