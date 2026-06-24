import { useState, useEffect } from "react";
import { obtenerTodosGruposMisAsignaturasUsuario, insertarMisGrupos } from "../../services/grupo.js";
import { useNavigate } from "react-router-dom";
import { logError } from "../../lib/logger.js";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup, faSave, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import "../../styles/user-common.css";
import { useTranslation } from "react-i18next";
import { translateCourse } from "../../lib/i18nLabels";

export default function SeleccionarGrupos() {
  const { t } = useTranslation();
  const [asignaturas, setAsignaturas] = useState([]);
  const [seleccionados, setSeleccionados] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const ObtenerTodosGruposMisAsignaturasUsuario = async () => {
      try {
        setCargando(true);
        const response = await obtenerTodosGruposMisAsignaturasUsuario();
        if (response && response.result && response.result.result) {
          const agrupadas = response.result.result.reduce((acc, item) => {
            const { codasignatura, nombreasignatura, numgrupo, curso } = item;
            if (!acc[codasignatura]) {
              acc[codasignatura] = {
                codasignatura,
                nombreasignatura,
                curso: curso || "Otros",
                grupos: [],
              };
            }
            if (!acc[codasignatura].grupos.includes(numgrupo)) {
              acc[codasignatura].grupos.push(numgrupo);
            }
            return acc;
          }, {});

          const asignaturasData = Object.values(agrupadas);
          setAsignaturas(asignaturasData);
        }
      } catch (error) {
        logError(error);
        setError(t("user.group_selection.load_error"));
      } finally {
        setCargando(false);
      }
    };
    ObtenerTodosGruposMisAsignaturasUsuario();
  }, []);

  const handleGrupoSeleccionadoParaAsignatura = (codasignatura, numGrupo) => {
    setSeleccionados((prev) => ({
      ...prev,
      [codasignatura]: numGrupo,
    }));
  };

  const handleGrupoPorCursoChange = (curso, numGrupo) => {
    const actualizaciones = {};
    asignaturas.forEach(asignatura => {
      if (asignatura.curso === curso) {
        // Solo asignamos si el grupo existe para esa asignatura
        if (asignatura.grupos.includes(parseInt(numGrupo)) || asignatura.grupos.includes(numGrupo.toString())) {
          actualizaciones[asignatura.codasignatura] = numGrupo;
        }
      }
    });
    setSeleccionados(prev => ({ ...prev, ...actualizaciones }));
  };

  const handleSubmit = async () => {
    const asignaturasSinGrupo = asignaturas.filter(
      ({ codasignatura }) => !seleccionados[codasignatura]
    );

    if (asignaturasSinGrupo.length > 0) {
      toast.warning(t("user.group_selection.select_all_warning"));
      return;
    }

    try {
      for (let [codasignatura, numgrupo] of Object.entries(seleccionados)) {
        await insertarMisGrupos(numgrupo, codasignatura);
      }
      toast.success(t("user.group_selection.success"));
      navigate("/miPerfil");
    } catch (error) {
      toast.error(t("user.group_selection.save_error"));
      logError(error);
    }
  };

  if (cargando) {
    return (
      <div className="page-container">
        <div className="user-loading">{t("user.group_selection.loading")}</div>
      </div>
    );
  }

  const todasSeleccionadas = asignaturas.length > 0 &&
    asignaturas.every(({ codasignatura }) => seleccionados[codasignatura]);

  return (
    <div className="page-container">
      <div className="content-wrap">
        <div className="page-header">
          <h1 className="page-title">{t("user.group_selection.title")}</h1>
          <p className="page-subtitle">
            {t("user.group_selection.subtitle")}
          </p>
        </div>

        {error && <div className="user-error">{error}</div>}

        {asignaturas.length > 0 ? (
          <>
            <div className="user-card" style={{ marginBottom: '30px', borderLeft: '4px solid var(--user-primary)' }}>
              <div style={{ fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FontAwesomeIcon icon={faInfoCircle} style={{ color: 'var(--user-primary)' }} />
                <span>{t("user.group_selection.quick_title")}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                {t("user.group_selection.quick_description")}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {[...new Set(asignaturas.map(a => a.curso))].sort().map(curso => (
                  <div key={curso} style={{ flex: '1 1 200px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>
                      {t("common.courses.course_label", { course: translateCourse(t, curso) })}:
                    </label>
                    <select
                      className="form-select"
                      onChange={(e) => handleGrupoPorCursoChange(curso, e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>-- {t("user.group_selection.assign_group")} --</option>
                      {[...new Set(asignaturas.filter(a => a.curso === curso).flatMap(a => a.grupos))].sort((a, b) => a - b).map(grupo => (
                        <option key={grupo} value={grupo}>{t("common.group_with_number", { group: grupo })}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
              {asignaturas.map(({ codasignatura, nombreasignatura, grupos }) => (
                <div key={codasignatura} className="user-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '15px', color: 'var(--user-primary)', fontSize: '1.2rem', fontWeight: 700, display: 'flex', gap: '10px' }}>
                    <FontAwesomeIcon icon={faLayerGroup} style={{ marginTop: '4px' }} />
                    <span>{nombreasignatura}</span>
                  </div>

                  <div className="form-group" style={{ marginTop: 'auto' }}>
                    <label className="form-label" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {t("user.group_selection.current_group")}
                    </label>
                    <select
                      className="form-select"
                      value={seleccionados[codasignatura] || ""}
                      onChange={(e) =>
                        handleGrupoSeleccionadoParaAsignatura(
                          codasignatura,
                          e.target.value
                        )
                      }
                    >
                      <option value="" disabled>-- {t("user.group_selection.select_your_group")} --</option>
                      {grupos.map((grupo) => (
                        <option key={grupo} value={grupo}>
                          {t("common.group_with_number", { group: grupo })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              margin: '20px auto 100px auto',
              width: '100%',
              maxWidth: '800px',
              background: 'var(--card-bg)',
              padding: '24px 32px',
              borderRadius: '16px',
              boxShadow: 'var(--card-shadow)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FontAwesomeIcon icon={faInfoCircle} style={{ color: todasSeleccionadas ? 'var(--success-color)' : 'var(--user-primary)' }} />
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                  {todasSeleccionadas ? t("user.group_selection.ready") : t("user.group_selection.missing")}
                </span>
              </div>
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={!todasSeleccionadas}
                style={{ minWidth: '180px', padding: '14px 28px' }}
              >
                <FontAwesomeIcon icon={faSave} /> {t("user.group_selection.save_groups")}
              </button>
            </div>
          </>
        ) : (
          <div className="user-card empty-state" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📚</div>
            <h3>{t("user.group_selection.empty_title")}</h3>
            <p>{t("user.group_selection.empty_message")}</p>
            <button className="btn btn-primary" onClick={() => navigate("/miPerfil")} style={{ marginTop: '20px', maxWidth: '250px' }}>
              {t("user.group_selection.go_profile")}
            </button>
          </div>
        )}
      </div>
      <div style={{ height: "40px" }} />
    </div>
  );
}
