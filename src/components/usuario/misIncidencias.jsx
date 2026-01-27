import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerIncidenciasAsignadasUsuario } from "../../services/incidencia.js";
import { formatearFecha } from "../../lib/formateadorFechas.js";
import { logError } from "../../lib/logger.js";
import "../../styles/user-common.css";
import { useTranslation } from "react-i18next";

export default function MisIncidencias() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [incidencias, setIncidencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("abierta");

  useEffect(() => {
    const cargarIncidencias = async () => {
      try {
        const data = await obtenerIncidenciasAsignadasUsuario();
        setIncidencias(data?.result?.result || []);
      } catch (error) {
        logError(error);
      } finally {
        setCargando(false);
      }
    };
    cargarIncidencias();
  }, []);

  // Filtrar las incidencias según el estado seleccionado
  const incidenciasFiltradas = incidencias.filter(
    (incidencia) => incidencia.estado_incidencia === filtroEstado
  );

  return (
    <div className="page-container">
      <div className="content-wrap">
        <div className="page-header">
          <h1 className="page-title">{t("navbar.my_incidents")}</h1>
          <p className="page-subtitle">
            {t("incidents.my_incidents_student_description")}
          </p>
        </div>

        <div className="filtro-container">
          <label htmlFor="filtroEstado">{t("incidents.filter_by_status")}</label>
          <select
            id="filtroEstado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="abierta">{t("incidents.status_open")}</option>
            <option value="asignada">{t("incidents.status_assigned")}</option>
            <option value="solucionada">{t("incidents.status_solved")}</option>
          </select>
        </div>

        {cargando ? (
          <div className="user-loading">{t("common.loading")}</div>
        ) : incidenciasFiltradas.length === 0 ? (
          <div className="user-card empty-state" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🛠️</div>
            <h3>{t("incidents.no_incidents_state")}</h3>
            <p>{t("incidents.no_incidents_help")}</p>
            <button
              onClick={() => navigate("/reportarIncidencia")}
              className="btn btn-primary"
              style={{ marginTop: '20px' }}
            >
              {t("incidents.report_new")}
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {incidenciasFiltradas.map((incidencia) => (
              <div key={incidencia.id} className="user-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: 'var(--user-primary)', marginBottom: '12px', fontSize: '1.2rem' }}>
                    {incidencia.tipo_incidencia?.charAt(0).toUpperCase() + incidencia.tipo_incidencia?.slice(1) || t("incidents.detail_title")}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <strong>{t("incidents.date")}:</strong> {formatearFecha(incidencia.fecha_creacion)}
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                    {incidencia.descripcion}
                  </p>
                </div>
                <div style={{
                  marginTop: 'auto',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  display: 'inline-block',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  width: 'fit-content',
                  backgroundColor: incidencia.estado_incidencia === 'abierta' ? 'rgba(245, 158, 11, 0.1)' :
                    incidencia.estado_incidencia === 'solucionada' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                  color: incidencia.estado_incidencia === 'abierta' ? 'var(--warning-color)' :
                    incidencia.estado_incidencia === 'solucionada' ? 'var(--success-color)' : 'var(--text-secondary)'
                }}>
                  {incidencia.estado_incidencia?.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ height: "80px" }} />
    </div>
  );
}
