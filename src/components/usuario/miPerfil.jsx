import { useState, useEffect } from "react";
import "../../styles/miPerfil-style.css";
import { obtenerDatosUsuario } from "../../services/usuario";
import { obtenerMiGrupoAsignatura } from "../../services/grupo";
import {
  guardarValoracionAsignatura,
  obtenerPreguntasValoracionAsignatura,
  superarAsignaturasUsuario,
} from "../../services/asignaturas";
import SeleccionarEstudio from "../usuario/seleccionarEstudio";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faBookOpen,
  faUserGraduate,
  faEnvelope,
  faUniversity,
  faTimes,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

export default function MiPerfil() {
  const { t } = useTranslation();
  const [usuario, setUsuario] = useState(null);
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeAviso, setMensajeAviso] = useState("");
  const [preguntasValoracion, setPreguntasValoracion] = useState([]);
  const [cargandoPreguntas, setCargandoPreguntas] = useState(false);
  const [asignaturaValorando, setAsignaturaValorando] = useState(null);
  const [respuestasValoracion, setRespuestasValoracion] = useState({});
  const [errorValoracion, setErrorValoracion] = useState("");
  const [enviandoValoracion, setEnviandoValoracion] = useState(false);
  const [asignaturaPendienteSuperar, setAsignaturaPendienteSuperar] = useState(null);
  const [superandoAsignaturaId, setSuperandoAsignaturaId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // Obtener datos del usuario
        const responseUsuario = await obtenerDatosUsuario();
        if (!responseUsuario.err) {
          setUsuario(responseUsuario.result.result);
        } else {
          throw new Error(responseUsuario.errmsg);
        }
        // Obtener asignaturas y grupos
        const responseAsignaturas = await obtenerMiGrupoAsignatura();
        if (!responseAsignaturas.err) {
          setAsignaturas(responseAsignaturas.result.result);
        } else {
          throw new Error(responseAsignaturas.errmsg);
        }
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    obtenerDatos();
  }, []);

  const cargarPreguntasValoracion = async () => {
    if (preguntasValoracion.length > 0) return preguntasValoracion;

    setCargandoPreguntas(true);
    const response = await obtenerPreguntasValoracionAsignatura();
    setCargandoPreguntas(false);

    if (response.err || response.result?.err) {
      throw new Error(response.errmsg || response.result?.message || t("user.my_profile.evaluation_load_error"));
    }

    const preguntas = response.result.result || [];
    setPreguntasValoracion(preguntas);
    return preguntas;
  };

  const abrirValoracionAsignatura = async (asignatura) => {
    setErrorValoracion("");
    setMensajeAviso("");
    setRespuestasValoracion({});
    setAsignaturaValorando(asignatura);

    try {
      await cargarPreguntasValoracion();
    } catch (error) {
      setErrorValoracion(error.message);
    }
  };

  const cerrarValoracionAsignatura = () => {
    if (enviandoValoracion) return;
    setAsignaturaValorando(null);
    setRespuestasValoracion({});
    setErrorValoracion("");
  };

  const actualizarRespuestaValoracion = (preguntaId, valor) => {
    setRespuestasValoracion((previas) => {
      const siguientes = { ...previas };
      if (valor === "" || valor === null || valor === undefined) {
        delete siguientes[preguntaId];
      } else {
        siguientes[preguntaId] = valor;
      }
      return siguientes;
    });
  };

  const preguntasPorBloque = preguntasValoracion.reduce((bloques, pregunta) => {
    const bloqueKey = pregunta.bloque;
    if (!bloques[bloqueKey]) {
      bloques[bloqueKey] = {
        bloque: pregunta.bloque,
        bloqueNombre: pregunta.bloqueNombre,
        preguntas: [],
      };
    }
    bloques[bloqueKey].preguntas.push(pregunta);
    return bloques;
  }, {});

  const construirRespuestasValoracion = () => {
    const preguntasObligatoriasSinResponder = preguntasValoracion.filter((pregunta) => {
      const esOpcional = pregunta.tipoRespuesta === "texto" || pregunta.condicion;
      return !esOpcional && respuestasValoracion[pregunta.id] === undefined;
    });

    if (preguntasObligatoriasSinResponder.length > 0) {
      throw new Error(t("user.my_profile.evaluation_required_error"));
    }

    return preguntasValoracion
      .filter((pregunta) => {
        const respuesta = respuestasValoracion[pregunta.id];
        return respuesta !== undefined && (typeof respuesta !== "string" || respuesta.trim() !== "");
      })
      .map((pregunta) => ({
        preguntaId: pregunta.id,
        respuesta: typeof respuestasValoracion[pregunta.id] === "string"
          ? respuestasValoracion[pregunta.id].trim()
          : respuestasValoracion[pregunta.id],
      }));
  };

  const enviarValoracionAsignatura = async () => {
    if (!asignaturaValorando) return;

    try {
      setErrorValoracion("");
      setEnviandoValoracion(true);
      const respuestas = construirRespuestasValoracion();
      const response = await guardarValoracionAsignatura(asignaturaValorando.codigo, respuestas);
      if (!response.err) {
        setAsignaturas((actuales) => actuales.map((asignatura) =>
          asignatura.id === asignaturaValorando.id
            ? { ...asignatura, evaluada: true }
            : asignatura
        ));
        setAsignaturaValorando(null);
        setRespuestasValoracion({});
        setMensajeExito(t("user.my_profile.evaluation_saved", { subject: asignaturaValorando.asignatura }));

        // Limpiar mensaje después de 5 segundos
        setTimeout(() => setMensajeExito(""), 5000);
      } else {
        throw new Error(response.errmsg || response.result?.message);
      }
    } catch (error) {
      setErrorValoracion(error.message);
    } finally {
      setEnviandoValoracion(false);
    }
  };

  const superarAsignatura = async (asignatura) => {
    setMensajeAviso("");
    setSuperandoAsignaturaId(asignatura.id);
    try {
      const response = await superarAsignaturasUsuario(asignatura.codigo);
      if (response.err || response.result?.err) {
        throw new Error(response.errmsg || response.result?.message || t("common.unexpected_error"));
      }
      setAsignaturas((actuales) => actuales.filter((actual) => actual.id !== asignatura.id));
      setAsignaturaPendienteSuperar(null);
      setMensajeExito(t("user.my_profile.approved_one", { subject: asignatura.asignatura }));
      setTimeout(() => setMensajeExito(""), 5000);
    } catch (error) {
      setMensajeAviso(t("user.my_profile.approve_error", {
        subject: asignatura.asignatura,
        error: error.message,
      }));
    } finally {
      setSuperandoAsignaturaId(null);
    }
  };

  const solicitarSuperarAsignatura = (asignatura) => {
    if (asignatura.evaluada) {
      superarAsignatura(asignatura);
      return;
    }
    setAsignaturaPendienteSuperar(asignatura);
  };

  const evaluarAntesDeSuperar = () => {
    const asignatura = asignaturaPendienteSuperar;
    setAsignaturaPendienteSuperar(null);
    if (asignatura) abrirValoracionAsignatura(asignatura);
  };

  const manejarSuperarTodasAsignaturas = async () => {
    setMensajeAviso(t("user.my_profile.approve_all_individually"));
    setTimeout(() => setMensajeAviso(""), 5000);
  };

  const renderCampoPregunta = (pregunta) => {
    const valorActual = respuestasValoracion[pregunta.id];

    if (pregunta.tipoRespuesta === "si_no") {
      return (
        <div className="valoracion-opciones">
          <button
            type="button"
            className={`valoracion-opcion ${valorActual === true ? "active" : ""}`}
            onClick={() => actualizarRespuestaValoracion(pregunta.id, true)}
          >
            {t("common.yes")}
          </button>
          <button
            type="button"
            className={`valoracion-opcion ${valorActual === false ? "active" : ""}`}
            onClick={() => actualizarRespuestaValoracion(pregunta.id, false)}
          >
            {t("common.no")}
          </button>
          {pregunta.condicion && (
            <button
              type="button"
              className={`valoracion-opcion ${valorActual === undefined ? "active-muted" : ""}`}
              onClick={() => actualizarRespuestaValoracion(pregunta.id, undefined)}
            >
              {t("user.my_profile.evaluation_not_applicable")}
            </button>
          )}
        </div>
      );
    }

    if (pregunta.tipoRespuesta === "escala_1_10") {
      return (
        <div className="valoracion-escala" aria-label={t("user.my_profile.evaluation_scale_label")}>
          {Array.from({ length: 10 }, (_, index) => index + 1).map((valor) => (
            <button
              key={valor}
              type="button"
              className={`valoracion-escala-btn ${Number(valorActual) === valor ? "active" : ""}`}
              onClick={() => actualizarRespuestaValoracion(pregunta.id, valor)}
            >
              {valor}
            </button>
          ))}
        </div>
      );
    }

    return (
      <textarea
        className="valoracion-textarea"
        value={valorActual || ""}
        maxLength={2000}
        rows={3}
        placeholder={t("user.my_profile.evaluation_text_placeholder")}
        onChange={(event) => actualizarRespuestaValoracion(pregunta.id, event.target.value)}
      />
    );
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          {t("user.my_profile.loading")}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h2>{t("user.my_profile.error_title")}</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {!usuario?.titulacion && <SeleccionarEstudio />}

      <div className="content-wrap">
        <div className="perfil-container">

          {/* Header de Página */}
          <div className="perfil-header-section">
            <h1 className="perfil-title">{t("user.my_profile.title")}</h1>
            <div className="perfil-subtitle">
              <p>{t("user.my_profile.subtitle")}</p>
            </div>
          </div>

          {/* Mensaje de Éxito */}
          {mensajeExito && (
            <div className="success-banner">
              <FontAwesomeIcon icon={faCheckCircle} size="lg" />
              <span>{mensajeExito}</span>
            </div>
          )}

          {mensajeAviso && (
            <div className="warning-banner">
              <span>{mensajeAviso}</span>
            </div>
          )}

          {/* User Header Card */}
          <div className="user-header-card">
            <div className="user-avatar-container">
              <FontAwesomeIcon icon={faUserGraduate} className="user-avatar-icon" />
            </div>
            <div className="user-info">
              <h2 className="user-name">{usuario.nombre_completo}</h2>
              <div className="user-email">
                <FontAwesomeIcon icon={faEnvelope} /> {usuario.correo}
              </div>
              <div className="user-badges">
                {usuario.titulacion && (
                  <span className="badge badge-degree">
                    <FontAwesomeIcon icon={faUniversity} style={{ marginRight: '6px' }} />
                    {usuario.titulacion}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sección de Asignaturas */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-title">
                <FontAwesomeIcon icon={faBookOpen} />
                <span>{t("user.my_profile.current_subjects")}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {asignaturas.length > 0 && (
                  <button
                    className="btn btn-success"
                    style={{ width: 'auto' }}
                    onClick={manejarSuperarTodasAsignaturas}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} /> {t("user.my_profile.approve_all")}
                  </button>
                )}
                <button
                  className="btn btn-outline"
                  style={{ width: 'auto' }}
                  onClick={() => navigate("/seleccionarAsignaturas")}
                >
                  {t("user.my_profile.enroll_new")}
                </button>
              </div>
            </div>

            {asignaturas.length > 0 ? (
              <div className="asignaturas-grid">
                {asignaturas.map((asignatura) => (
                  <div key={asignatura.id} className="asignatura-card">
                    <div className="asignatura-header">
                      <span className="grupo-badge">{t("common.group_with_number", { group: asignatura.numgrupo })}</span>
                    </div>
                    <div className="asignatura-name">{asignatura.asignatura}</div>

                    <div className="asignatura-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => abrirValoracionAsignatura(asignatura)}
                        disabled={asignatura.evaluada}
                      >
                        <FontAwesomeIcon icon={faStar} />
                        {asignatura.evaluada
                          ? t("user.my_profile.evaluated_this_year")
                          : t("user.my_profile.evaluate_subject")}
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={() => solicitarSuperarAsignatura(asignatura)}
                        disabled={superandoAsignaturaId === asignatura.id}
                      >
                        <FontAwesomeIcon icon={faCheckCircle} />
                        {superandoAsignaturaId === asignatura.id
                          ? t("common.processing")
                          : t("user.my_profile.mark_approved")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📚</div>
                <h3>{t("user.my_profile.empty_title")}</h3>
                <p>{t("user.my_profile.empty_message")}</p>
                <button
                  className="btn btn-primary"
                  style={{ maxWidth: '200px', margin: '20px auto' }}
                  onClick={() => navigate("/seleccionarAsignaturas")}
                >
                  {t("user.my_profile.select_subjects")}
                </button>
              </div>
            )}
          </div>

          {asignaturaValorando && (
            <div className="valoracion-modal-overlay" role="dialog" aria-modal="true">
              <div className="valoracion-modal">
                <div className="valoracion-modal-header">
                  <div>
                    <h2>{t("user.my_profile.evaluation_title")}</h2>
                    <p>{asignaturaValorando.asignatura}</p>
                  </div>
                  <button
                    type="button"
                    className="valoracion-cerrar"
                    aria-label={t("common.close")}
                    onClick={cerrarValoracionAsignatura}
                    disabled={enviandoValoracion}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                <div className="valoracion-modal-body">
                  <p className="valoracion-intro">
                    {t("user.my_profile.evaluation_intro")}
                  </p>
                  <p className="valoracion-contexto">
                    {t("user.my_profile.evaluation_context", {
                      group: asignaturaValorando.numgrupo,
                      year: asignaturaValorando.cursoAcademico,
                    })}
                  </p>

                  {cargandoPreguntas ? (
                    <div className="valoracion-loading">{t("user.my_profile.evaluation_loading")}</div>
                  ) : errorValoracion && preguntasValoracion.length === 0 ? (
                    <div className="valoracion-error">{errorValoracion}</div>
                  ) : (
                    Object.values(preguntasPorBloque).map((bloque) => (
                      <section key={bloque.bloque} className="valoracion-bloque">
                        <h3>{bloque.bloque}. {bloque.bloqueNombre}</h3>
                        {bloque.preguntas.map((pregunta) => (
                          <div key={pregunta.id} className="valoracion-pregunta">
                            <div className="valoracion-pregunta-header">
                              <label>{pregunta.enunciado}</label>
                              {pregunta.tipoRespuesta !== "texto" && !pregunta.condicion && (
                                <span className="valoracion-required">{t("user.my_profile.evaluation_required")}</span>
                              )}
                              {pregunta.condicion && (
                                <span className="valoracion-conditional">{t("user.my_profile.evaluation_conditional")}</span>
                              )}
                            </div>
                            {renderCampoPregunta(pregunta)}
                          </div>
                        ))}
                      </section>
                    ))
                  )}

                  {errorValoracion && preguntasValoracion.length > 0 && (
                    <div className="valoracion-error">{errorValoracion}</div>
                  )}
                </div>

                <div className="valoracion-modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={cerrarValoracionAsignatura}
                    disabled={enviandoValoracion}
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={enviarValoracionAsignatura}
                    disabled={cargandoPreguntas || enviandoValoracion || preguntasValoracion.length === 0}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                    {enviandoValoracion ? t("user.my_profile.evaluation_sending") : t("user.my_profile.evaluation_submit")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {asignaturaPendienteSuperar && (
            <div className="valoracion-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirmar-superar-title">
              <div className="confirmacion-superar-modal">
                <div className="confirmacion-superar-icon">?</div>
                <h2 id="confirmar-superar-title">{t("user.my_profile.skip_evaluation_title")}</h2>
                <p>
                  {t("user.my_profile.skip_evaluation_message", {
                    subject: asignaturaPendienteSuperar.asignatura,
                  })}
                </p>
                <div className="confirmacion-superar-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={evaluarAntesDeSuperar}
                  >
                    <FontAwesomeIcon icon={faStar} />
                    {t("user.my_profile.evaluate_first")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => superarAsignatura(asignaturaPendienteSuperar)}
                    disabled={superandoAsignaturaId === asignaturaPendienteSuperar.id}
                  >
                    {superandoAsignaturaId === asignaturaPendienteSuperar.id
                      ? t("common.processing")
                      : t("user.my_profile.approve_without_evaluating")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={() => setAsignaturaPendienteSuperar(null)}
                    disabled={superandoAsignaturaId !== null}
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
