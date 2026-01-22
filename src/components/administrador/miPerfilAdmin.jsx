import { useState, useEffect } from "react";
import "../../styles/miPerfil-style.css";
import { getTodasSolicitudesPermuta, actualizarVigenciaPermutas, actualizarVigenciaSolicitudes } from "../../services/permuta";
import { obtenerDatosUsuarioAdmin } from "../../services/usuario";
import { toast } from "react-toastify";
import CrearGradoAdmin from "./CrearGradoAdmin";
import CrearAsignatura from "./CrearAsignatura";
import ImportAsignaturas from "./importAsignaturas";
import { subidaArchivo } from "../../services/subidaArchivos";

export default function MiPerfilAdmin() {
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
      if (resPermutas?.err) errores.push(resPermutas.errmsg || "Error en permutas");
      if (resSolicitudes?.err) errores.push(resSolicitudes.errmsg || "Error en solicitudes");

      if (errores.length === 0) {
        toast.success("Se ha retirado la vigencia de permutas y solicitudes correctamente.");
        // refrescar lista de permutas local
        const ref = await getTodasSolicitudesPermuta();
        if (!ref.err) setPermutas(ref.result.result);
      } else {
        toast.error(errores.join(" — "));
      }
    } catch (err) {
      toast.error("Error al retirar la vigencia.");
    } finally {
      setAccionRetirarLoading(false);
      setModalRetirarOpen(false);
    }
  };

  const exportarCSV = () => {
    if (permutas.length === 0) {
      toast.warning("No hay datos para exportar.");
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
      toast.warning("Por favor, selecciona un archivo.");
      return;
    }

    if (filePlantilla.type !== "application/pdf") {
      toast.error("El archivo debe ser un PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("tipo", "plantilla");
    formData.append("file", filePlantilla);

    const promise = subidaArchivo(formData);

    toast.promise(promise, {
      pending: "Subiendo plantilla...",
      success: "Plantilla actualizada correctamente",
      error: "Error al subir la plantilla"
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
    return <div className="loading-text">Cargando datos...</div>;
  }

  if (error) {
    return <div className="error-text">Error: {error}</div>;
  }

  return (
    <div className="page-container">
      <div className="content-wrap">
        <div className="perfil-container">
          <h1 className="perfil-title">Perfil de Administrador</h1>
          <p className="perfil-subtitle">
            Gestione permutas, grados, asignaturas y configuraciones del sistema desde este panel centralizado.
          </p>

          {/* Header con Información Personal */}
          <div className="admin-header-card">
            <div className="admin-info">
              <div className="admin-avatar">
                <span className="avatar-icon">👤</span>
              </div>
              <div className="admin-details">
                <h2 className="admin-name">{usuario?.nombre_completo}</h2>
                <p className="admin-email">{usuario?.correo}</p>
              </div>
            </div>
          </div>

          {/* Grid de Secciones Desplegables */}
          <div className="sections-grid">

            {/* Gestión de Permutas */}
            <div className="accordion-section">
              <button
                className={`accordion-header ${activeSection === 'permutas' ? 'active' : ''}`}
                onClick={() => toggleSection('permutas')}
              >
                <span className="section-icon">🔄</span>
                <span className="section-title">Gestión de Permutas</span>
                <span className={`accordion-icon ${activeSection === 'permutas' ? 'rotate' : ''}`}>▼</span>
              </button>
              <div className={`accordion-content ${activeSection === 'permutas' ? 'open' : ''}`}>
                <div className="sub-section">
                  <h3>📥 Exportar Datos</h3>
                  <p className="sub-section-description">Descarga todas las permutas en formato CSV</p>
                  <button className="action-btn primary-btn" onClick={exportarCSV}>
                    Exportar Permutas en CSV
                  </button>
                </div>

                <div className="sub-section">
                  <h3>📄 Actualizar Plantilla de Solicitud</h3>
                  <p className="sub-section-description">Sube una nueva plantilla PDF para las solicitudes</p>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      id="file-upload-plantilla"
                      accept=".pdf"
                      onChange={(e) => setFilePlantilla(e.target.files[0])}
                      className="file-input"
                    />
                    <label htmlFor="file-upload-plantilla" className="file-label">
                      {filePlantilla ? filePlantilla.name : "Seleccionar archivo PDF"}
                    </label>
                    <button
                      className="action-btn primary-btn"
                      onClick={handleUploadPlantilla}
                      disabled={!filePlantilla}
                    >
                      Subir Plantilla
                    </button>
                  </div>
                </div>

                <div className="sub-section danger-section">
                  <h3>⚠️ Retirar Vigencia</h3>
                  <p className="sub-section-description warning-text">
                    Al realizar esta acción todas las permutas y solicitudes dejarán de estar vigentes. Esta acción no puede deshacerse.
                  </p>
                  <button className="action-btn danger-btn" onClick={abrirModalRetirar}>
                    Retirar la vigencia de las permutas
                  </button>
                </div>
              </div>
            </div>

            {/* Gestión de Asignaturas */}
            <div className="accordion-section">
              <button
                className={`accordion-header ${activeSection === 'asignaturas' ? 'active' : ''}`}
                onClick={() => toggleSection('asignaturas')}
              >
                <span className="section-icon">📚</span>
                <span className="section-title">Gestión de Asignaturas</span>
                <span className={`accordion-icon ${activeSection === 'asignaturas' ? 'rotate' : ''}`}>▼</span>
              </button>
              <div className={`accordion-content ${activeSection === 'asignaturas' ? 'open' : ''}`}>
                <div className="sub-section">
                  <h3>📤 Importar Masivamente</h3>
                  <p className="sub-section-description">Carga múltiples asignaturas desde un archivo</p>
                  <ImportAsignaturas />
                </div>
                <div className="sub-section">
                  <h3>➕ Crear Individualmente</h3>
                  <p className="sub-section-description">Añade una nueva asignatura al sistema</p>
                  <CrearAsignatura />
                </div>
              </div>
            </div>

            {/* Gestión de Grados */}
            <div className="accordion-section">
              <button
                className={`accordion-header ${activeSection === 'grados' ? 'active' : ''}`}
                onClick={() => toggleSection('grados')}
              >
                <span className="section-icon">🎓</span>
                <span className="section-title">Gestión de Grados</span>
                <span className={`accordion-icon ${activeSection === 'grados' ? 'rotate' : ''}`}>▼</span>
              </button>
              <div className={`accordion-content ${activeSection === 'grados' ? 'open' : ''}`}>
                <div className="sub-section">
                  <h3>➕ Crear Nuevo Grado</h3>
                  <p className="sub-section-description">Añade un nuevo grado académico al sistema</p>
                  <CrearGradoAdmin />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modal de confirmación para retirar vigencia */}
      {modalRetirarOpen && (
        <div className="modal-overlay" onClick={cerrarModalRetirar}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Confirmar acción</h3>
            </div>
            <div className="modal-body">
              <p>Al realizar esta acción todas las permutas y solicitudes no estarán vigentes. Esta acción no puede deshacerse.</p>
            </div>
            <div className="modal-actions">
              <button
                className="modal-btn cancel-btn"
                onClick={cerrarModalRetirar}
                disabled={accionRetirarLoading}
              >
                Cancelar
              </button>
              <button
                className="modal-btn confirm-btn danger-btn"
                onClick={confirmarRetirarVigencia}
                disabled={accionRetirarLoading}
              >
                {accionRetirarLoading ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{ height: "80px" }} />
    </div>
  );
}