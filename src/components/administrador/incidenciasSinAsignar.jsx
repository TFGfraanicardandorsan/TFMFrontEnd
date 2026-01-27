import { useEffect, useState } from "react";
import "../../styles/admin-common.css";
import { useNavigate } from "react-router-dom";
import { obtenerIncidenciasSinAsignar, asignarmeIncidencia } from "../../services/incidencia.js";
import { formatearFecha } from "../../lib/formateadorFechas.js";
import { toast } from "react-toastify";
import { logError } from "../../lib/logger.js";
import { useTranslation } from "react-i18next";

export default function IncidenciasSinAsignar() {
    const { t } = useTranslation();
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
                setError(t("incidents.error_loading"));
                logError(error);
            } finally {
                setCargando(false);
            }
        };
        cargarIncidencias();
    }, [t]);

    const handleAsignarIncidencia = async (idIncidencia) => {
        try {
            const response = await asignarmeIncidencia(idIncidencia);
            if (!response.err) {
                setIncidencias(incidencias.filter((incidencia) => incidencia.id !== idIncidencia));
                toast.success(t("incidents.assign_success"));
            } else {
                throw new Error(response.errmsg);
            }
        } catch (error) {
            toast.error(t("incidents.error_loading"));
            logError(error);
        }
    };

    return (
        <>
            <div className="admin-page-container">
                <div className="admin-content-wrap">
                    {/* Header */}
                    <div className="admin-page-header">
                        <h1 className="admin-page-title">📋 {t("incidents.unassigned_title")}</h1>
                        <p className="admin-page-subtitle">
                            {t("incidents.unassigned_subtitle")}
                        </p>
                    </div>

                    {/* Contenido */}
                    {cargando ? (
                        <div className="admin-loading">{t("incidents.loading")}</div>
                    ) : error ? (
                        <div className="admin-error">
                            <p>{error}</p>
                            <button className="admin-btn admin-btn-primary admin-mt-md" onClick={() => navigate("/")}>
                                {t("incidents.back_home")}
                            </button>
                        </div>
                    ) : incidencias.length === 0 ? (
                        <div className="admin-empty-state">
                            <div className="admin-empty-state-icon">✅</div>
                            <p className="admin-empty-state-text">{t("incidents.no_unassigned")}</p>
                        </div>
                    ) : (
                        <div className="admin-grid admin-grid-2">
                            {incidencias.map((incidencia) => (
                                <div key={incidencia.id} className="admin-card">
                                    <div className="admin-card-header">
                                        <h2 className="admin-card-title">
                                            <span className="admin-card-icon">🎫</span>
                                            {t("incidents.detail_title")} #{incidencia.id}
                                        </h2>
                                        <span className="admin-badge admin-badge-danger">
                                            {incidencia.estado_incidencia}
                                        </span>
                                    </div>
                                    <div className="admin-card-body">
                                        <p><strong>{t("incidents.creation_date")}:</strong> {formatearFecha(incidencia.fecha_creacion)}</p>
                                        <p><strong>{t("incidents.type")}:</strong> {incidencia.tipo_incidencia}</p>
                                        <p><strong>{t("incidents.description")}:</strong> {incidencia.descripcion}</p>
                                    </div>
                                    <div className="admin-card-footer">
                                        <button
                                            className="admin-btn admin-btn-primary"
                                            onClick={() => handleAsignarIncidencia(incidencia.id)}
                                        >
                                            👤 {t("incidents.assign_me")}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div style={{ height: "80px" }} />
        </>
    );
}
