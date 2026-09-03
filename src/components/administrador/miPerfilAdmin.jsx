import { useState, useEffect } from "react";
import "../../styles/admin-common.css";
import { getTodasSolicitudesPermuta, actualizarVigenciaPermutas, actualizarVigenciaSolicitudes } from "../../services/permuta";
import { obtenerDatosUsuarioAdmin } from "../../services/usuario";
import { toast } from "react-toastify";
import CrearGradoAdmin from "./CrearGradoAdmin";
import CrearAsignatura from "./CrearAsignatura";
import ImportAsignaturas from "./importAsignaturas";
import { subidaArchivo } from "../../services/subidaArchivos";
import { useTranslation } from "react-i18next";

export default function MiPerfilAdmin() {
  const { t } = useTranslation();
  const [usuario, setUsuario] = useState(null);
  const [permutas, setPermutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filePlantilla, setFilePlantilla] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [modalRetirarOpen, setModalRetirarOpen] = useState(false);
  const [accionRetirarLoading, setAccionRetirarLoading] = useState(false);

  const toggleSection = (sectionName) => {
    setActiveSection(activeSection === sectionName ? null : sectionName);
  };


  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const responseUsuario = await obtenerDatosUsuarioAdmin();
        if (!responseUsuario.err) {
          setUsuario(responseUsuario.result.result);
        } else {
          throw new Error(responseUsuario.errmsg);
        }

        // Obtener lista de permutas
        const responsePermutas = await getTodasSolicitudesPermuta();
        if (!responsePermutas.err) {
          setPermutas(responsePermutas.result.result);
        } else {
          throw new Error(responsePermutas.errmsg);
        }

        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const abrirModalRetirar = () => setModalRetirarOpen(true);
  const cerrarModalRetirar = () => setModalRetirarOpen(false);

  const confirmarRetirarVigencia = async () => {
    setAccionRetirarLoading(true);
    try {
      const [resPermutas, resSolicitudes] = await Promise.all([
        actualizarVigenciaPermutas(),
        actualizarVigenciaSolicitudes()
      ]);

      const errores = [];
      if (resPermutas?.err) errores.push(resPermutas.errmsg || t("admin.profile.remove_errors.swaps"));
      if (resSolicitudes?.err) errores.push(resSolicitudes.errmsg || t("admin.profile.remove_errors.requests"));

      if (errores.length === 0) {
        toast.success(t("admin.profile.remove_success"));
        // refrescar lista de permutas local
        const ref = await getTodasSolicitudesPermuta();
        if (!ref.err) setPermutas(ref.result.result);
      } else {
        toast.error(errores.join(" — "));
      }
    } catch {
      toast.error(t("admin.profile.remove_error"));
    } finally {
      setAccionRetirarLoading(false);
      setModalRetirarOpen(false);
    }
  };

  const exportarCSV = () => {
    if (permutas.length === 0) {
      toast.warning(t("admin.profile.no_export_data"));
      return;
    }

    const datosAplanados = permutas.map((permuta) => ({
      solicitud_id: permuta.solicitud_id,
      nombre_completo: permuta.usuario.nombre_completo,
      uvus: permuta.usuario.uvus,
      estudio: permuta.usuario.estudio,
      asignatura_nombre: permuta.asignatura.nombre,
      asignatura_codigo: permuta.asignatura.codigo,
      grupo_solicitante: permuta.grupo_solicitante,
      grupos_deseados: permuta.grupos_deseados.join(" | "),
    }));

    const encabezados = Object.keys(datosAplanados[0]).join(",");
    const filas = datosAplanados.map((fila) =>
      Object.values(fila).map((valor) => `"${valor}"`).join(",")
    );
    const contenidoCSV = [encabezados, ...filas].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + contenidoCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "permutas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadPlantilla = async () => {
    if (!filePlantilla) {
      toast.warning(t("admin.profile.select_file"));
      return;
    }

    if (filePlantilla.type !== "application/pdf") {
      toast.error(t("admin.profile.pdf_required"));
      return;
    }

    const formData = new FormData();
    formData.append("tipo", "plantilla");
    formData.append("file", filePlantilla);

    const promise = (async () => {
      const respuesta = await subidaArchivo(formData);
      if (respuesta?.err || !respuesta?.result?.fileId) {
        throw new Error(
          respuesta?.errmsg || t("admin.profile.upload_error")
        );
      }
      return respuesta;
    })();

    toast.promise(promise, {
      pending: t("admin.profile.upload_pending"),
      success: t("admin.profile.upload_success"),
      error: t("admin.profile.upload_error")
    });

    try {
      await promise;
      setFilePlantilla(null);
      // Reset input value if possible, or just rely on state
      document.getElementById("file-upload-plantilla").value = "";
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="admin-loading">{t("admin.profile.loading")}</div>;
  }

  if (error) {
    return <div className="admin-error">{t("common.error_prefix", { error })}</div>;
  }

  return (
    <div className="admin-page-container">
      <div className="admin-content-wrap">
        <div className="perfil-container">
          <div className="admin-page-header">
            <h1 className="admin-page-title">{t("admin.profile.title")}</h1>
            <p className="admin-page-subtitle">
              {t("admin.profile.subtitle")}
            </p>
          </div>

          {/* Header con Información Personal */}
          <div className="admin-header-card">
            <div className="admin-info">
              <div className="admin-avatar">
                <span className="admin-avatar-icon">👤</span>
              </div>
              <div className="admin-details">
                <h2 className="admin-name">{usuario?.nombre_completo}</h2>
                <p className="admin-email">{usuario?.correo}</p>
              </div>
            </div>
          </div>

          {/* Grid de Secciones Desplegables */}
          <div className="admin-grid">

            {/* Gestión de Permutas */}
            <div className="admin-accordion-section">
              <button
                className={`admin-accordion-header ${activeSection === 'permutas' ? 'active' : ''}`}
                onClick={() => toggleSection('permutas')}
              >
                <span className="admin-section-icon">🔄</span>
                <span className="admin-section-title">{t("admin.profile.swaps_management")}</span>
                <span className={`admin-accordion-icon ${activeSection === 'permutas' ? 'rotate' : ''}`}>▼</span>
              </button>
              <div className={`admin-accordion-content ${activeSection === 'permutas' ? 'open' : ''}`}>
                <div className="admin-sub-section">
                  <h3>{t("admin.profile.export_data")}</h3>
                  <p className="sub-section-description">{t("admin.profile.export_description")}</p>
                  <button className="admin-btn admin-btn-primary" onClick={exportarCSV}>
                    {t("admin.profile.export_button")}
                  </button>
                </div>

                <div className="admin-sub-section">
                  <h3>{t("admin.profile.update_template")}</h3>
                  <p className="sub-section-description">{t("admin.profile.update_template_description")}</p>
                  <div className="admin-file-input-wrapper">
                    <input
                      type="file"
                      id="file-upload-plantilla"
                      accept=".pdf"
                      onChange={(e) => setFilePlantilla(e.target.files[0])}
                      className="admin-file-input"
                    />
                    <label htmlFor="file-upload-plantilla" className="admin-file-label">
                      {filePlantilla ? filePlantilla.name : t("admin.profile.select_pdf")}
                    </label>
                    <button
                      className="admin-btn admin-btn-primary"
                      onClick={handleUploadPlantilla}
                      disabled={!filePlantilla}
                    >
                      {t("admin.profile.upload_template")}
                    </button>
                  </div>
                </div>

                <div className="admin-sub-section danger-section">
                  <h3>{t("admin.profile.remove_validity")}</h3>
                  <p className="sub-section-description warning-text" style={{ color: '#991b1b' }}>
                    {t("admin.profile.remove_warning")}
                  </p>
                  <button className="admin-btn admin-btn-danger" onClick={abrirModalRetirar}>
                    {t("admin.profile.remove_button")}
                  </button>
                </div>
              </div>
            </div>

            {/* Gestión de Asignaturas */}
            <div className="admin-accordion-section">
              <button
                className={`admin-accordion-header ${activeSection === 'asignaturas' ? 'active' : ''}`}
                onClick={() => toggleSection('asignaturas')}
              >
                <span className="admin-section-icon">📚</span>
                <span className="admin-section-title">{t("admin.profile.subjects_management")}</span>
                <span className={`admin-accordion-icon ${activeSection === 'asignaturas' ? 'rotate' : ''}`}>▼</span>
              </button>
              <div className={`admin-accordion-content ${activeSection === 'asignaturas' ? 'open' : ''}`}>
                <div className="admin-sub-section">
                  <h3>{t("admin.profile.import_bulk")}</h3>
                  <p className="sub-section-description">{t("admin.profile.import_bulk_description")}</p>
                  <ImportAsignaturas />
                </div>
                <div className="admin-sub-section">
                  <h3>{t("admin.profile.create_individual")}</h3>
                  <p className="sub-section-description">{t("admin.profile.create_subject_description")}</p>
                  <CrearAsignatura />
                </div>
              </div>
            </div>

            {/* Gestión de Grados */}
            <div className="admin-accordion-section">
              <button
                className={`admin-accordion-header ${activeSection === 'grados' ? 'active' : ''}`}
                onClick={() => toggleSection('grados')}
              >
                <span className="admin-section-icon">🎓</span>
                <span className="admin-section-title">{t("admin.profile.degrees_management")}</span>
                <span className={`admin-accordion-icon ${activeSection === 'grados' ? 'rotate' : ''}`}>▼</span>
              </button>
              <div className={`admin-accordion-content ${activeSection === 'grados' ? 'open' : ''}`}>
                <div className="admin-sub-section">
                  <h3>{t("admin.profile.create_degree")}</h3>
                  <p className="sub-section-description">{t("admin.profile.create_degree_description")}</p>
                  <CrearGradoAdmin />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modal de confirmación para retirar vigencia */}
      {modalRetirarOpen && (
        <div className="admin-modal-overlay" onClick={cerrarModalRetirar}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{t("admin.profile.confirm_title")}</h3>
            </div>
            <div className="admin-modal-body">
              <p>{t("admin.profile.confirm_remove_message")}</p>
            </div>
            <div className="admin-modal-footer">
              <button
                className="admin-btn admin-btn-secondary"
                onClick={cerrarModalRetirar}
                disabled={accionRetirarLoading}
              >
                {t("common.cancel")}
              </button>
              <button
                className="admin-btn admin-btn-danger"
                onClick={confirmarRetirarVigencia}
                disabled={accionRetirarLoading}
              >
                {accionRetirarLoading ? t("common.processing") : t("common.confirm")}
              </button>
            </div>          </div>
        </div>
      )}
    </div>
  );
}
