import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { obtenerEstadisticasValoracionesAsignaturas } from "../../services/estadisticas.js";
import { resultadoAPI } from "../../lib/bloquesPermuta.js";
import "../../styles/admin-common.css";
import "../../styles/estadisticas-style.css";

const normalizarBusqueda = (valor) => String(valor ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .trim();

export default function ValoracionesAsignaturas() {
  const { t } = useTranslation();
  const [valoraciones, setValoraciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarValoraciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resultado = resultadoAPI(await obtenerEstadisticasValoracionesAsignaturas());
      if (!Array.isArray(resultado)) throw new Error(t("admin.subject_evaluations.invalid_response"));
      setValoraciones(resultado.filter((asignatura) => Number(asignatura.totalValoraciones) > 0));
    } catch (err) {
      setError(err.message || t("admin.subject_evaluations.load_error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void cargarValoraciones();
  }, [cargarValoraciones]);

  const valoracionesFiltradas = useMemo(() => {
    const filtro = normalizarBusqueda(busqueda);
    if (!filtro) return valoraciones;
    return valoraciones.filter((asignatura) => normalizarBusqueda([
      asignatura.nombre,
      asignatura.siglas,
      asignatura.codigo,
    ].join(" ")).includes(filtro));
  }, [busqueda, valoraciones]);

  const totalValoraciones = valoraciones.reduce(
    (total, asignatura) => total + Number(asignatura.totalValoraciones || 0),
    0
  );

  const formatearEstadisticaPregunta = (pregunta) => {
    if (pregunta.tipoRespuesta === "si_no") {
      return t("admin.stats.yes_no_summary", {
        yes: pregunta.estadisticas?.si ?? 0,
        no: pregunta.estadisticas?.no ?? 0,
        yesPercent: pregunta.estadisticas?.porcentajeSi ?? 0,
        noPercent: pregunta.estadisticas?.porcentajeNo ?? 0,
      });
    }
    if (pregunta.tipoRespuesta === "escala_1_10") {
      return pregunta.estadisticas?.media === null || pregunta.estadisticas?.media === undefined
        ? t("admin.stats.no_answers")
        : t("admin.stats.scale_summary", {
          avg: pregunta.estadisticas.media,
          min: pregunta.estadisticas.minimo,
          max: pregunta.estadisticas.maximo,
        });
    }
    return t("admin.stats.open_answers_count", {
      count: pregunta.estadisticas?.respuestas?.length || 0,
    });
  };

  return (
    <div className="admin-page-container">
      <div className="admin-content-wrap">
        <header className="admin-page-header">
          <h1 className="admin-page-title">{t("admin.stats.subject_evaluation_detail")}</h1>
          <p className="admin-page-subtitle">{t("admin.subject_evaluations.subtitle")}</p>
        </header>

        <section className="admin-card stats-full-width" aria-labelledby="subject-evaluations-heading">
          <div className="admin-card-header valoraciones-panel-heading">
            <div>
              <h2 className="admin-card-title" id="subject-evaluations-heading">
                <span className="admin-card-icon">📋</span>
                {t("admin.subject_evaluations.panel_title")}
              </h2>
              {!loading && !error && (
                <p className="valoraciones-panel-summary" role="status">
                  {t("admin.subject_evaluations.summary", {
                    subjects: valoraciones.length,
                    evaluations: totalValoraciones,
                  })}
                </p>
              )}
            </div>
            <button className="admin-btn admin-btn-secondary" onClick={cargarValoraciones} disabled={loading}>
              {t("admin.subject_evaluations.refresh")}
            </button>
          </div>

          <div className="admin-card-body">
            <div className="valoraciones-panel-toolbar">
              <label htmlFor="valoraciones-search">{t("admin.subject_evaluations.search_label")}</label>
              <input
                id="valoraciones-search"
                type="search"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder={t("admin.subject_evaluations.search_placeholder")}
              />
            </div>

            {loading ? (
              <div className="admin-loading" role="status">{t("admin.subject_evaluations.loading")}</div>
            ) : error ? (
              <div className="admin-error" role="alert">{error}</div>
            ) : valoraciones.length === 0 ? (
              <div className="admin-empty-state">
                <p className="admin-empty-state-text">{t("admin.stats.no_subject_evaluations")}</p>
              </div>
            ) : valoracionesFiltradas.length === 0 ? (
              <div className="admin-empty-state">
                <p className="admin-empty-state-text">{t("admin.subject_evaluations.no_results")}</p>
              </div>
            ) : (
              <div className="valoraciones-stats-list">
                {valoracionesFiltradas.map((asignatura, index) => (
                  <details className="valoraciones-subject" key={asignatura.codigo} open={index === 0}>
                    <summary>
                      <span>{asignatura.nombre} ({asignatura.siglas || asignatura.codigo})</span>
                      <strong>{t("admin.stats.evaluation_count", { count: asignatura.totalValoraciones })}</strong>
                    </summary>

                    {(asignatura.comparativaGrupos || []).length > 0 && (
                      <section className="valoraciones-group-comparison">
                        <h3>{t("admin.stats.group_comparison")}</h3>
                        <p>{t("admin.stats.group_comparison_hint")}</p>
                        <div className="valoraciones-year-list">
                          {asignatura.comparativaGrupos.map((curso) => (
                            <div className="valoraciones-year" key={`${asignatura.codigo}-${curso.cursoAcademico}`}>
                              <h4>{curso.cursoAcademico === "historico"
                                ? t("admin.stats.historical_data")
                                : t("admin.stats.academic_year", { year: curso.cursoAcademico })}</h4>
                              <div className="valoraciones-group-grid">
                                {(curso.grupos || []).map((grupo) => (
                                  <div className="valoraciones-group-card" key={`${curso.cursoAcademico}-${grupo.grupoId ?? "legacy"}`}>
                                    <span>{grupo.grupoNumero
                                      ? t("common.group_with_number", { group: grupo.grupoNumero })
                                      : t("admin.stats.unknown_group")}</span>
                                    <strong>{grupo.mediaGlobal === null ? "—" : `${grupo.mediaGlobal}/10`}</strong>
                                    <small>{t("admin.stats.evaluation_count", { count: grupo.totalValoraciones })}</small>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {(asignatura.bloques || []).map((bloque) => (
                      <section className="valoraciones-block" key={`${asignatura.codigo}-${bloque.bloque}`}>
                        <h3>{bloque.bloque}. {bloque.bloqueNombre}</h3>
                        <div className="valoraciones-question-grid">
                          {(bloque.preguntas || []).map((pregunta) => {
                            const respuestas = pregunta.estadisticas?.respuestas || [];
                            return (
                              <div className="valoraciones-question" key={pregunta.id}>
                                <p>{pregunta.enunciado}</p>
                                <div className="valoraciones-summary">{formatearEstadisticaPregunta(pregunta)}</div>
                                {pregunta.tipoRespuesta === "texto" && respuestas.length > 0 && (
                                  <ul className="valoraciones-open-answers">
                                    {respuestas.slice(0, 8).map((respuesta, respuestaIndex) => (
                                      <li key={`${pregunta.id}-${respuestaIndex}`}>{respuesta.respuesta}</li>
                                    ))}
                                    {respuestas.length > 8 && (
                                      <li className="valoraciones-more">
                                        {t("admin.stats.more_open_answers", { count: respuestas.length - 8 })}
                                      </li>
                                    )}
                                  </ul>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </details>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
