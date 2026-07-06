import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { obtenerEstadisticasPermutas, obtenerEstadisticasSolicitudes, obtenerEstadisticasIncidencias, obtenerEstadisticasUsuarios, obtenerEstadisticasValoracionesAsignaturas } from '../../services/estadisticas';
import "../../styles/admin-common.css";
import "../../styles/estadisticas-style.css";
import { useTranslation } from 'react-i18next';
import { translateIncidentStatus, translateIncidentType, translateRequestStatus, translateRole, translateSwapStatus } from '../../lib/i18nLabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Estadisticas() {
  const { t } = useTranslation();
  const [estadisticasPermutas, setEstadisticasPermutas] = useState(null);
  const [estadisticasSolicitudes, setEstadisticasSolicitudes] = useState(null);
  const [estadisticasIncidencias, setEstadisticasIncidencias] = useState(null);
  const [estadisticasUsuarios, setEstadisticasUsuarios] = useState(null);
  const [estadisticasValoracionesAsignaturas, setEstadisticasValoracionesAsignaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const [permutasData, solicitudesData, incidenciasData, usuariosData, valoracionesData] = await Promise.all([
          obtenerEstadisticasPermutas(),
          obtenerEstadisticasSolicitudes(),
          obtenerEstadisticasIncidencias(),
          obtenerEstadisticasUsuarios(),
          obtenerEstadisticasValoracionesAsignaturas(),
        ]);
        setEstadisticasPermutas(permutasData.result.data);
        setEstadisticasSolicitudes(solicitudesData.result.data);
        setEstadisticasIncidencias(incidenciasData.result.result);
        setEstadisticasUsuarios(usuariosData.result.result);
        setEstadisticasValoracionesAsignaturas(valoracionesData.result.result || []);
        setLoading(false);
      } catch {
        setError(t("admin.stats.load_error"));
        setLoading(false);
      }
    };
    cargarEstadisticas();
  }, [t]);

  if (loading) return <div className="admin-loading">{t("admin.stats.loading")}</div>;
  if (error) return <div className="admin-error">{error}</div>;

  const permutasPorEstadoData = {
    labels: estadisticasPermutas.permutasPorEstado.map(item => translateSwapStatus(t, item.estado)),
    datasets: [{
      label: t("admin.stats.swaps_by_status"),
      data: estadisticasPermutas.permutasPorEstado.map(item => item.cantidad),
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
      ],
    }]
  };

  const permutasPorAsignaturaData = {
    labels: estadisticasPermutas.permutasPorAsignatura.map(item => item.siglas),
    datasets: [{
      label: t("admin.stats.swaps_by_subject"),
      data: estadisticasPermutas.permutasPorAsignatura.map(item => item.cantidad),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
    }]
  };

  const solicitudesPorEstadoData = {
    labels: estadisticasSolicitudes.solicitudesPorEstado.map(item => translateRequestStatus(t, item.estado)),
    datasets: [{
      data: estadisticasSolicitudes.solicitudesPorEstado.map(item => item.cantidad),
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
      ],
    }]
  };
  const incidenciasPorEstadoData = {
    labels: estadisticasIncidencias.incidenciasPorEstado.map(item => translateIncidentStatus(t, item.estado_incidencia)),
    datasets: [{
      data: estadisticasIncidencias.incidenciasPorEstado.map(item => item.cantidad),
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
      ],
    }]
  };
  const incidenciasPorTipoData = {
    labels: estadisticasIncidencias.incidenciasPorTipo.map(item => translateIncidentType(t, item.tipo_incidencia)),
    datasets: [{
      data: estadisticasIncidencias.incidenciasPorTipo.map(item => item.cantidad),
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
      ],
    }]
  };

  const incidenciasPorMesData = {
    labels: estadisticasIncidencias.incidenciasPorMes.map(item => `${item.mes}/${item.anio}`),
    datasets: [{
      label: t("admin.stats.incidents_by_month"),
      data: estadisticasIncidencias.incidenciasPorMes.map(item => parseInt(item.cantidad, 10)),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
    }]
  };

  // Función para generar colores aleatorios
  function generarColoresAleatorios(n) {
    return Array.from({ length: n }, () =>
      `rgba(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},0.5)`
    );
  }

  const usuariosPorRolData = estadisticasUsuarios && estadisticasUsuarios.usuariosPorRol
    ? {
      labels: estadisticasUsuarios.usuariosPorRol.map(item => translateRole(t, item.rol)),
      datasets: [{
        label: t("admin.stats.users_by_role"),
        data: estadisticasUsuarios.usuariosPorRol.map(item => item.cantidad),
        backgroundColor: [
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
      }]
    }
    : null;

  const usuariosPorEstudioData = estadisticasUsuarios && estadisticasUsuarios.usuariosPorEstudio
    ? {
      labels: estadisticasUsuarios.usuariosPorEstudio.map(item => item.siglas),
      datasets: [{
        label: t("admin.stats.users_by_study"),
        data: estadisticasUsuarios.usuariosPorEstudio.map(item => item.cantidad),
        backgroundColor: generarColoresAleatorios(estadisticasUsuarios.usuariosPorEstudio.length),
      }]
    }
    : null;

  const solicitudesPorGradoData = estadisticasSolicitudes.solicitudesPorGrado
    ? {
      labels: estadisticasSolicitudes.solicitudesPorGrado.map(item => item.siglas),
      datasets: [{
        label: t("admin.stats.requests_by_degree"),
        data: estadisticasSolicitudes.solicitudesPorGrado.map(item => item.cantidad),
        backgroundColor: generarColoresAleatorios(estadisticasSolicitudes.solicitudesPorGrado.length),
      }]
    }
    : null;

  const valoracionesConDatos = estadisticasValoracionesAsignaturas.filter((asignatura) => asignatura.totalValoraciones > 0);
  const valoracionesGlobales = valoracionesConDatos
    .map((asignatura) => {
      const preguntaGlobal = asignatura.bloques
        .flatMap((bloque) => bloque.preguntas)
        .find((pregunta) => pregunta.codigo === "valoracion_global");

      return {
        asignatura,
        media: preguntaGlobal?.estadisticas?.media ?? null,
      };
    })
    .filter((item) => item.media !== null);

  const valoracionesGlobalesData = valoracionesGlobales.length > 0
    ? {
      labels: valoracionesGlobales.map(({ asignatura }) => asignatura.siglas || asignatura.codigo),
      datasets: [{
        label: t("admin.stats.subject_global_rating"),
        data: valoracionesGlobales.map(({ media }) => media),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
      }]
    }
    : null;

  const formatearEstadisticaPregunta = (pregunta) => {
    if (pregunta.tipoRespuesta === "si_no") {
      return t("admin.stats.yes_no_summary", {
        yes: pregunta.estadisticas.si,
        no: pregunta.estadisticas.no,
        yesPercent: pregunta.estadisticas.porcentajeSi,
        noPercent: pregunta.estadisticas.porcentajeNo,
      });
    }

    if (pregunta.tipoRespuesta === "escala_1_10") {
      return pregunta.estadisticas.media === null
        ? t("admin.stats.no_answers")
        : t("admin.stats.scale_summary", {
          avg: pregunta.estadisticas.media,
          min: pregunta.estadisticas.minimo,
          max: pregunta.estadisticas.maximo,
        });
    }

    const respuestasAbiertas = pregunta.estadisticas?.respuestas || [];
    return t("admin.stats.open_answers_count", {
      count: respuestasAbiertas.length,
    });
  };

  return (
    <>
      <div className="admin-page-container">
        <div className="admin-content-wrap">
          {/* Header */}
          <div className="admin-page-header">
            <h1 className="admin-page-title">{t("admin.stats.title")}</h1>
            <p className="admin-page-subtitle">
              {t("admin.stats.subtitle")}
            </p>
          </div>

          {/* Grid de Estadísticas */}
          <div className="admin-grid admin-grid-2">
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  <span className="admin-card-icon">🔄</span>
                  {t("admin.stats.swaps_by_status")}
                </h2>
              </div>
              <div className="admin-card-body">
                <Pie key="permutasPorEstadoData" data={permutasPorEstadoData} />
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  <span className="admin-card-icon">📚</span>
                  {t("admin.stats.swaps_by_subject")}
                </h2>
              </div>
              <div className="admin-card-body">
                <Bar key="permutasPorAsignaturaData" data={permutasPorAsignaturaData} />
              </div>
            </div>

            {/* Permutas agrupadas por grado */}
            {estadisticasPermutas && estadisticasPermutas.permutasPorGrado && (() => {
              const permutasPorGradoGrouped = estadisticasPermutas.permutasPorGrado.reduce((acc, curr) => {
                if (!acc[curr.grado_nombre]) {
                  acc[curr.grado_nombre] = {
                    labels: [],
                    data: [],
                    grado_siglas: curr.grado_siglas
                  };
                }
                acc[curr.grado_nombre].labels.push(curr.asignatura_siglas + ' (' + curr.asignatura_codigo + ')');
                acc[curr.grado_nombre].data.push(curr.cantidad);
                return acc;
              }, {});

              return Object.entries(permutasPorGradoGrouped).map(([gradoNombre, datos]) => {
                const data = {
                  labels: datos.labels,
                  datasets: [{
                    label: t("admin.stats.swaps_in_degree", { degree: datos.grado_siglas }),
                    data: datos.data,
                    backgroundColor: generarColoresAleatorios(datos.data.length),
                  }]
                };
                return (
                  <div className="admin-card" key={gradoNombre}>
                    <div className="admin-card-header">
                      <h2 className="admin-card-title">
                        <span className="admin-card-icon">🎓</span>
                        {t("admin.stats.swaps_in_degree", { degree: gradoNombre })}
                      </h2>
                    </div>
                    <div className="admin-card-body">
                      <Bar data={data} options={{
                        plugins: {
                          legend: {
                            display: false
                          },
                          title: {
                            display: true,
                            text: t("admin.stats.swaps_in_degree", { degree: datos.grado_siglas })
                          }
                        }
                      }} />
                    </div>
                  </div>
                );
              });
            })()}

            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  <span className="admin-card-icon">📝</span>
                  {t("admin.stats.requests_by_status")}
                </h2>
              </div>
              <div className="admin-card-body">
                <Pie key="solicitudesPorEstadoData" data={solicitudesPorEstadoData} />
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  <span className="admin-card-icon">🐛</span>
                  {t("admin.stats.incidents_by_status")}
                </h2>
              </div>
              <div className="admin-card-body">
                <Pie key="incidenciasPorEstadoData" data={incidenciasPorEstadoData} />
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  <span className="admin-card-icon">📋</span>
                  {t("admin.stats.incidents_by_type")}
                </h2>
              </div>
              <div className="admin-card-body">
                <Pie key="incidenciasPorTipoData" data={incidenciasPorTipoData} />
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  <span className="admin-card-icon">📅</span>
                  {t("admin.stats.incidents_by_month")}
                </h2>
              </div>
              <div className="admin-card-body">
                <Bar key="incidenciasPorMesData" data={incidenciasPorMesData} />
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  <span className="admin-card-icon">👥</span>
                  {t("admin.stats.users_by_role")}
                </h2>
              </div>
              <div className="admin-card-body">
                {usuariosPorRolData && <Bar key="usuariosPorRolData" data={usuariosPorRolData} />}
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  <span className="admin-card-icon">🎓</span>
                  {t("admin.stats.users_by_study")}
                </h2>
              </div>
              <div className="admin-card-body">
                {usuariosPorEstudioData && <Bar key="usuariosPorEstudioData" data={usuariosPorEstudioData} />}
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  <span className="admin-card-icon">📊</span>
                  {t("admin.stats.requests_by_degree")}
                </h2>
              </div>
              <div className="admin-card-body">
                {solicitudesPorGradoData && <Bar key="solicitudesPorGradoData" data={solicitudesPorGradoData} />}
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  <span className="admin-card-icon">📈</span>
                  {t("admin.stats.subject_global_rating")}
                </h2>
              </div>
              <div className="admin-card-body">
                {valoracionesGlobalesData ? (
                  <Bar
                    key="valoracionesGlobalesData"
                    data={valoracionesGlobalesData}
                    options={{
                      scales: {
                        y: {
                          min: 0,
                          max: 10,
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="admin-empty-state">
                    <p className="admin-empty-state-text">{t("admin.stats.no_subject_evaluations")}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-card stats-full-width">
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  <span className="admin-card-icon">📋</span>
                  {t("admin.stats.subject_evaluation_detail")}
                </h2>
              </div>
              <div className="admin-card-body">
                {valoracionesConDatos.length === 0 ? (
                  <div className="admin-empty-state">
                    <p className="admin-empty-state-text">{t("admin.stats.no_subject_evaluations")}</p>
                  </div>
                ) : (
                  <div className="valoraciones-stats-list">
                    {valoracionesConDatos.map((asignatura, index) => (
                      <details className="valoraciones-subject" key={asignatura.codigo} open={index === 0}>
                        <summary>
                          <span>
                            {asignatura.nombre} ({asignatura.siglas || asignatura.codigo})
                          </span>
                          <strong>{t("admin.stats.evaluation_count", { count: asignatura.totalValoraciones })}</strong>
                        </summary>

                        {(asignatura.comparativaGrupos || []).length > 0 && (
                          <section className="valoraciones-group-comparison">
                            <h3>{t("admin.stats.group_comparison")}</h3>
                            <p>{t("admin.stats.group_comparison_hint")}</p>
                            <div className="valoraciones-year-list">
                              {asignatura.comparativaGrupos.map((curso) => (
                                <div className="valoraciones-year" key={`${asignatura.codigo}-${curso.cursoAcademico}`}>
                                  <h4>
                                    {curso.cursoAcademico === "historico"
                                      ? t("admin.stats.historical_data")
                                      : t("admin.stats.academic_year", { year: curso.cursoAcademico })}
                                  </h4>
                                  <div className="valoraciones-group-grid">
                                    {curso.grupos.map((grupo) => (
                                      <div
                                        className="valoraciones-group-card"
                                        key={`${curso.cursoAcademico}-${grupo.grupoId ?? "legacy"}`}
                                      >
                                        <span>
                                          {grupo.grupoNumero
                                            ? t("common.group_with_number", { group: grupo.grupoNumero })
                                            : t("admin.stats.unknown_group")}
                                        </span>
                                        <strong>
                                          {grupo.mediaGlobal === null
                                            ? "—"
                                            : `${grupo.mediaGlobal}/10`}
                                        </strong>
                                        <small>
                                          {t("admin.stats.evaluation_count", {
                                            count: grupo.totalValoraciones,
                                          })}
                                        </small>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>
                        )}

                        {asignatura.bloques.map((bloque) => (
                          <section className="valoraciones-block" key={`${asignatura.codigo}-${bloque.bloque}`}>
                            <h3>{bloque.bloque}. {bloque.bloqueNombre}</h3>
                            <div className="valoraciones-question-grid">
                              {bloque.preguntas.map((pregunta) => (
                                <div className="valoraciones-question" key={pregunta.id}>
                                  <p>{pregunta.enunciado}</p>
                                  <div className="valoraciones-summary">
                                    {formatearEstadisticaPregunta(pregunta)}
                                  </div>

                                  {pregunta.tipoRespuesta === "texto" && (pregunta.estadisticas?.respuestas || []).length > 0 && (
                                    <ul className="valoraciones-open-answers">
                                      {(pregunta.estadisticas?.respuestas || []).slice(0, 8).map((respuesta, respuestaIndex) => (
                                        <li key={`${pregunta.id}-${respuestaIndex}`}>
                                          {respuesta.respuesta}
                                        </li>
                                      ))}
                                      {(pregunta.estadisticas?.respuestas || []).length > 8 && (
                                        <li className="valoraciones-more">
                                          {t("admin.stats.more_open_answers", {
                                            count: (pregunta.estadisticas?.respuestas || []).length - 8,
                                          })}
                                        </li>
                                      )}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </section>
                        ))}
                      </details>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
