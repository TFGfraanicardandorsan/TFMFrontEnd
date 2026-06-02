import { useState, useEffect } from "react";
import "../../styles/miPerfil-style.css";
import { obtenerDatosUsuario } from "../../services/usuario";
import { obtenerMiGrupoAsignatura } from "../../services/grupo";
import { superarAsignaturasUsuario } from "../../services/asignaturas";
import SeleccionarEstudio from "../usuario/seleccionarEstudio";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faBookOpen, faUserGraduate, faEnvelope, faUniversity } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

export default function MiPerfil() {
  const { t } = useTranslation();
  const [usuario, setUsuario] = useState(null);
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState("");
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

  const manejarSuperarAsignatura = async (idAsignatura, codigo) => {
    try {
      const response = await superarAsignaturasUsuario(codigo);
      if (!response.err) {
        const asignaturaAprobada = asignaturas.find(asignatura => asignatura.id === idAsignatura);
        setAsignaturas(asignaturas.filter(asignatura => asignatura.id !== idAsignatura));
        setMensajeExito(t("user.my_profile.approved_one", { subject: asignaturaAprobada.asignatura }));

        // Limpiar mensaje después de 5 segundos
        setTimeout(() => setMensajeExito(""), 5000);
      } else {
        throw new Error(response.errmsg);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const manejarSuperarTodasAsignaturas = async () => {
    if (asignaturas.length === 0) return;

    setLoading(true);
    try {
      for (const asignatura of asignaturas) {
        const response = await superarAsignaturasUsuario(asignatura.codigo);
        if (response.err) {
          throw new Error(t("user.my_profile.approve_error", { subject: asignatura.asignatura, error: response.errmsg }));
        }
      }
      setAsignaturas([]);
      setMensajeExito(t("user.my_profile.approved_all"));
      setTimeout(() => setMensajeExito(""), 5000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
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
                        className="btn btn-success"
                        onClick={() => manejarSuperarAsignatura(asignatura.id, asignatura.codigo)}
                      >
                        <FontAwesomeIcon icon={faCheckCircle} />
                        {t("user.my_profile.mark_approved")}
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

        </div>
      </div>
    </div>
  );
}
