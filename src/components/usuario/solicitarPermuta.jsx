import { useState, useEffect } from "react";
import { obtenerTodosGruposMisAsignaturasSinGrupoUsuario } from "../../services/grupo.js";
import { solicitarPermuta } from "../../services/permuta.js";
import { useNavigate } from "react-router-dom";
import "../../styles/user-common.css";
// import "../../styles/seleccionarGrupos-style.css"; // Ya no necesario si migramos todo
import { toast } from "react-toastify";
import { logError } from "../../lib/logger.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChalkboardTeacher, faSave, faCheckCircle, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

export default function SeleccionarGruposSinGrupo() {
  const { t } = useTranslation();
  const [asignaturas, setAsignaturas] = useState([]);
  const [seleccionados, setSeleccionados] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ObtenerTodosGruposMisAsignaturasSinGrupoUsuario = async () => {
      try {
        setCargando(true);
        const response = await obtenerTodosGruposMisAsignaturasSinGrupoUsuario();

        if (response && Array.isArray(response.result.result)) {
          const agrupadas = response.result.result.reduce((acc, item) => {
            const { codasignatura, nombreasignatura, numgrupo } = item;
            const key = codasignatura.toString();
            if (!acc[key]) {
              acc[key] = {
                codasignatura: key,
                nombreasignatura,
                grupos: [],
              };
            }
            acc[key].grupos.push(numgrupo);
            return acc;
          }, {});

          setAsignaturas(Object.values(agrupadas));
        } else {
          logError(t("user.swap_request.no_subjects_log"));
        }
      } catch (error) {
        logError(error);
        setError(t("user.swap_request.load_error"));
      } finally {
        setCargando(false);
      }
    };

    ObtenerTodosGruposMisAsignaturasSinGrupoUsuario();
  }, []);

  const handleGrupoSeleccionadoParaAsignatura = (codasignatura, numgrupo) => {
    setSeleccionados((prev) => ({
      ...prev,
      [codasignatura.toString()]: numgrupo,
    }));
  };

  const handleSubmit = async () => {
    try {
      const keys = Object.keys(seleccionados);
      if (keys.length === 0) {
        toast.info(t("user.swap_request.select_one_warning"));
        return;
      }

      for (const rawCod of keys) {
        const rawGrupo = seleccionados[rawCod];
        if (rawGrupo) {
          // Limpiar y convertir a entero por seguridad (el backend espera enteros)
          // El replace(/\D/g, '') elimina cualquier carácter que no sea un dígito (como la 'G')
          const codasignatura = parseInt(rawCod.toString().replace(/\D/g, ''), 10);
          const grupoDeseado = parseInt(rawGrupo.toString().replace(/\D/g, ''), 10);

          if (!isNaN(codasignatura) && !isNaN(grupoDeseado)) {
            // El servicio espera (asignatura, grupos_deseados)
            await solicitarPermuta(codasignatura, [grupoDeseado]);
          }
        }
      }
      toast.success(t("user.swap_request.success"));
      navigate("/misSolicitudesPermuta");
    } catch (error) {
      toast.error(t("user.swap_request.submit_error"));
      logError(error);
    }
  };


  const haySeleccion = asignaturas.some(
    ({ codasignatura }) => seleccionados[codasignatura.toString()]
  );

  if (cargando) {
    return (
      <div className="page-container">
        <div className="user-loading">{t("user.swap_request.loading")}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrap">
        <div className="page-header">
          <h1 className="page-title">{t("user.swap_request.title")}</h1>
          <p className="page-subtitle">
            {t("user.swap_request.subtitle")}
          </p>
        </div>

        {error && <div className="user-error">{error}</div>}

        {asignaturas.length > 0 ? (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '100px' // Margen extra para no tapar con el footer fixed
            }}>
              {asignaturas.map(({ codasignatura, nombreasignatura, grupos }) => (
                <div key={codasignatura.toString()} className="user-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '15px', color: 'var(--user-primary)', fontSize: '1.1rem', fontWeight: 600, display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <FontAwesomeIcon icon={faChalkboardTeacher} style={{ marginTop: '4px' }} />
                    <span>{nombreasignatura}</span>
                  </div>

                  <div className="form-group" style={{ marginTop: 'auto' }}>
                    <label htmlFor={`select-${codasignatura}`} className="form-label" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {t("user.swap_request.desired_group")}
                    </label>
                    <select
                      id={`select-${codasignatura}`}
                      className="form-select"
                      value={seleccionados[codasignatura.toString()] || ""}
                      onChange={(e) =>
                        handleGrupoSeleccionadoParaAsignatura(
                          codasignatura,
                          e.target.value
                        )
                      }
                    >
                      <option value="" disabled>-- {t("user.swap_request.select_group_placeholder")} --</option>
                      {grupos.map((grupo) => (
                        <option key={grupo} value={grupo}>
                          {t("common.group_with_number", { group: grupo })}
                        </option>
                      ))}
                    </select>
                  </div>
                  {seleccionados[codasignatura.toString()] && (
                    <div style={{ marginTop: '10px', color: 'var(--success-color)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FontAwesomeIcon icon={faCheckCircle} /> {t("user.swap_request.ready_for_group", { group: seleccionados[codasignatura.toString()] })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{
              margin: '40px auto',
              width: '100%',
              maxWidth: '800px',
              background: 'var(--card-bg)',
              padding: '20px 30px',
              borderRadius: '16px',
              boxShadow: 'var(--card-shadow)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid rgba(43, 87, 154, 0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                <FontAwesomeIcon icon={faInfoCircle} style={{ color: 'var(--user-primary)' }} />
                <span className="info-text-responsive" style={{ fontWeight: 500 }}>
                  {haySeleccion ? t("user.swap_request.ready") : t("user.swap_request.waiting")}
                </span>
              </div>
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={!haySeleccion}
                style={{
                  minWidth: '180px',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  fontSize: '1rem'
                }}
              >
                <FontAwesomeIcon icon={faSave} /> {t("user.swap_request.submit")}
              </button>
            </div>
            {/* Espaciador para no solapar con el footer fixed */}
            <div style={{ height: '120px' }} />

          </>
        ) : (
          <div className="user-card empty-state">
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📚</div>
            <h3>{t("user.swap_request.empty_title")}</h3>
            <p>{t("user.swap_request.empty_message")}</p>
          </div>
        )}
      </div>
    </div>


  );
}
