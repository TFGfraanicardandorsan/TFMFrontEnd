import { useState, useEffect } from "react";
import {
  PDFCheckBox,
  PDFDocument,
  PDFRadioGroup,
  PDFTextField,
} from "pdf-lib";
import { saveAs } from "file-saver";
import {
  obtenerPlantillaPermuta,
  subidaArchivo,
  servirArchivo,
} from "../../services/subidaArchivos.js";
import {
  verListaPermutas,
  listarPermutas,
  firmarPermuta,
  aceptarPermuta,
  validarSolicitudPermuta,
} from "../../services/permuta.js";
import "../../styles/user-common.css";
import { dayValue, monthValue, yearValue } from "../../lib/generadorFechas.js";
import {
  validarDNI,
  validarLetraDNI,
  validarNIF,
  validarTIE,
  validarCampoObligatorio,
  validarCodigoPostal,
  validarTelefono,
} from "../../lib/validadores.js";
import Modal from "./Modal.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { logError } from "../../lib/logger.js";
import { useTranslation } from "react-i18next";

const NUMERO_FILAS_ASIGNATURAS = 12;

// La plantilla oficial 2026-27 fue exportada desde Word con nombres
// automáticos. El orden se ha obtenido de los widgets y sus coordenadas.
const CAMPOS_PLANTILLA_2627 = {
  titulaciones: {
    "GII-IC": "Check Box1",
    "GII-IS": "Check Box5",
    "GII-TI": "Check Box6",
    GISA: "Check Box7",
  },
  fechas: {
    dia: "Text71",
    mes: "Text72",
    anio: "Text73",
  },
  estudiantes: {
    1: ["Text2", "Text3", "Text4", "Text8", "Text9", "Text10", "Text11", "Text12"],
    2: ["Text27", "Text28", "Text29", "Text30", "Text31", "Text68", "Text69", "Text70"],
  },
  asignaturas: {
    estudiante1: [
      "Text13", "Text14", "Text15", "Text16", "Text17", "Text18",
      "Text19", "Text22", "Text23", "Text24", "Text25", "Text26",
    ],
    estudiante2: [
      "Text44", "Text45", "Text46", "Text47", "Text48", "Text49",
      "Text50", "Text51", "Text52", "Text53", "Text54", "Text55",
    ],
    codigo1: [
      "Text32", "Text33", "Text34", "Text35", "Text36", "Text37",
      "Text38", "Text39", "Text40", "Text41", "Text42", "Text43",
    ],
    codigo2: [
      "Text56", "Text57", "Text58", "Text59", "Text60", "Text61",
      "Text62", "Text63", "Text64", "Text65", "Text66", "Text67",
    ],
  },
};

const normalizarNombreCampo = (nombre) => String(nombre ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toUpperCase()
  .replace(/[^A-Z0-9]/g, "");

const buscarCampo = (form, nombres, TipoCampo) => {
  const candidatos = nombres.filter(Boolean).map(normalizarNombreCampo);
  return form.getFields().find((campo) => (
    campo instanceof TipoCampo
    && candidatos.includes(normalizarNombreCampo(campo.getName()))
  ));
};

const exigirCampoTexto = (form, nombres, descripcion) => {
  const campo = buscarCampo(form, nombres, PDFTextField);
  if (!campo) {
    const disponibles = form.getFields().map((item) => item.getName()).join(", ");
    throw new Error(
      `La plantilla PDF no contiene el campo ${descripcion}. Campos disponibles: ${disponibles}`
    );
  }
  return campo;
};

const seleccionarEstudio = (form, estudio) => {
  const checkbox = buscarCampo(
    form,
    [estudio, CAMPOS_PLANTILLA_2627.titulaciones[estudio]],
    PDFCheckBox
  );
  if (checkbox) {
    checkbox.check();
    checkbox.enableReadOnly();
    return;
  }

  const grupos = form.getFields().filter((campo) => campo instanceof PDFRadioGroup);
  const grupoCompatible = grupos.find((grupo) => grupo.getOptions().some(
    (opcion) => normalizarNombreCampo(opcion) === normalizarNombreCampo(estudio)
  ));
  if (grupoCompatible) {
    const opcion = grupoCompatible.getOptions().find(
      (valor) => normalizarNombreCampo(valor) === normalizarNombreCampo(estudio)
    );
    grupoCompatible.select(opcion);
    grupoCompatible.enableReadOnly();
    return;
  }

  const campoTexto = buscarCampo(
    form,
    ["TITULACION", "TITULACIÓN", "GRADO", "ESTUDIO"],
    PDFTextField
  );
  if (campoTexto) {
    campoTexto.setText(estudio);
    campoTexto.enableReadOnly();
    return;
  }

  const disponibles = form.getFields().map((campo) => campo.getName()).join(", ");
  throw new Error(
    `La plantilla PDF no contiene un campo compatible para la titulación ${estudio}. Campos disponibles: ${disponibles}`
  );
};

const definicionesCamposEstudiante = (numero) => [
  { nombres: [`DNI${numero}`, CAMPOS_PLANTILLA_2627.estudiantes[numero][0]], descripcion: `DNI${numero}` },
  { nombres: [`LETRA${numero}`, CAMPOS_PLANTILLA_2627.estudiantes[numero][1]], descripcion: `LETRA${numero}` },
  { nombres: [`NOMBRE${numero}`, CAMPOS_PLANTILLA_2627.estudiantes[numero][2]], descripcion: `NOMBRE${numero}` },
  { nombres: [`DOMICILIO${numero}`, CAMPOS_PLANTILLA_2627.estudiantes[numero][3]], descripcion: `DOMICILIO${numero}` },
  { nombres: [`POBLACION${numero}`, `POBLACIÓN${numero}`, CAMPOS_PLANTILLA_2627.estudiantes[numero][4]], descripcion: `POBLACION${numero}` },
  { nombres: [`COD-POSTAL${numero}`, `CODPOSTAL${numero}`, `CP${numero}`, CAMPOS_PLANTILLA_2627.estudiantes[numero][5]], descripcion: `COD-POSTAL${numero}` },
  { nombres: [`PROVINCIA${numero}`, CAMPOS_PLANTILLA_2627.estudiantes[numero][6]], descripcion: `PROVINCIA${numero}` },
  { nombres: [`TELEFONO${numero}`, `TELÉFONO${numero}`, CAMPOS_PLANTILLA_2627.estudiantes[numero][7]], descripcion: `TELEFONO${numero}` },
];

export default function GeneracionPDF() {
  const { t } = useTranslation();
  const [dni, setDni] = useState("");
  const [letraDNI, setLetraDNI] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("DNI");
  const [domicilio, setDomicilio] = useState("");
  const [poblacion, setPoblacion] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [provincia, setProvincia] = useState("");
  const [telefono, setTelefono] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [permutas, setPermutas] = useState([]);
  const [permutaId, setPermutaId] = useState(null);
  const [estadoPermuta, setEstadoPermuta] = useState("BORRADOR");
  const [pdfExistente, setPdfExistente] = useState(null);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({
    dni: "",
    letraDNI: "",
    domicilio: "",
    poblacion: "",
    codigoPostal: "",
    provincia: "",
    telefono: "",
  });
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const idsNavegacionSerializados = JSON.stringify(
    location.state?.IdsPermuta ?? null
  );

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargandoDatos(true);
        setErrorCarga(null);
        const lista = await verListaPermutas();
        if (lista?.err || lista?.result?.err) {
          throw new Error(
            lista?.errmsg
            || lista?.result?.message
            || t("pdf_generation.errors.load_error")
          );
        }
        const gruposPermutas = lista?.result?.result ?? [];
        const idsNavegacion = JSON.parse(idsNavegacionSerializados);
        const idsGuardados = JSON.parse(
          sessionStorage.getItem("permutasSeleccionadas") || "null"
        );
        const idsSeleccionados = Array.isArray(idsNavegacion)
          ? idsNavegacion
          : idsGuardados;
        if (!Array.isArray(idsSeleccionados) || idsSeleccionados.length === 0) {
          throw new Error(t("pdf_generation.errors.no_selection"));
        }
        const idsSeleccionadosSet = new Set(idsSeleccionados);
        const grupoSeleccionado = gruposPermutas.find((grupo) => {
          const idsGrupo = (grupo.permutas ?? []).map((permuta) => permuta.permuta_id);
          return idsSeleccionados.every((id) => idsGrupo.includes(id));
        });

        if (!grupoSeleccionado) {
          throw new Error(t("pdf_generation.errors.no_selection"));
        }

        const permutasSeleccionadas = grupoSeleccionado.permutas.filter(
          (permuta) => idsSeleccionadosSet.has(permuta.permuta_id)
        );

        const idsPermutas = permutasSeleccionadas.map(
          (permuta) => permuta.permuta_id
        );
        const permuta = await listarPermutas(idsPermutas);
        if (permuta?.err || permuta?.result?.error || permuta?.result?.err) {
          throw new Error(
            permuta?.errmsg
            || permuta?.result?.message
            || t("pdf_generation.errors.load_error")
          );
        }
        const documento = permuta?.result?.result?.[0];
        if (!documento) {
          throw new Error(t("pdf_generation.errors.load_error"));
        }

        setUsuarios(grupoSeleccionado.usuarios);
        setPermutas(permutasSeleccionadas);
        const estado = documento.estado;
        const fileId = documento.archivo;
        setPermutaId(documento.id);

        if (estado !== "BORRADOR") {
          setEstadoPermuta(estado);
          const bytes = await servirArchivo("buzon", fileId);
          setPdfExistente(bytes);

          if (estado === "ACEPTADA" || estado === "VALIDADA") {
            const blob = new Blob([bytes], { type: "application/pdf" });
            const pdfUrl = URL.createObjectURL(blob);
            setPdfUrl(pdfUrl);
          }
        }
      } catch (error) {
        logError(error);
        setErrorCarga(error.message || t("pdf_generation.errors.load_error"));
        toast.error(t("pdf_generation.errors.load_error"));
      } finally {
        setCargandoDatos(false);
      }
    };
    void cargarDatos();
  }, [idsNavegacionSerializados, t]);

  useEffect(() => () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
  }, [pdfUrl]);

  const generarPDF = async () => {
    try {
      if (cargandoDatos || errorCarga || usuarios.length < 2 || permutas.length === 0) {
        throw new Error(t("pdf_generation.errors.load_error"));
      }
      const existingPdfBytes =
        estadoPermuta !== "BORRADOR" && pdfExistente
          ? pdfExistente
          : await obtenerPlantillaPermuta();

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const form = pdfDoc.getForm();

      // Titulación. Las plantillas de cada curso pueden cambiar separadores,
      // usar un grupo de radio o un campo de texto en lugar de checkboxes.
      const estudio = usuarios[0]?.estudio;
      if (!estudio) {
        throw new Error("No se ha podido determinar la titulación del estudiante");
      }
      seleccionarEstudio(form, estudio);

      // Fechas (bloqueadas siempre)
      const day = exigirCampoTexto(
        form,
        ["DAY", "DIA", "DÍA", CAMPOS_PLANTILLA_2627.fechas.dia],
        "de día"
      );
      const month = exigirCampoTexto(
        form,
        ["MONTH", "MES", CAMPOS_PLANTILLA_2627.fechas.mes],
        "de mes"
      );
      const year = exigirCampoTexto(
        form,
        ["YEAR", "ANIO", "AÑO", CAMPOS_PLANTILLA_2627.fechas.anio],
        "de año"
      );
      day.setText(dayValue);
      month.setText(monthValue);
      year.setText(yearValue);
      [day, month, year].forEach((f) => f.enableReadOnly());

      // Asignaturas (bloqueadas siempre)
      for (let index = 0; index < NUMERO_FILAS_ASIGNATURAS; index++) {
        const asignatura = permutas[index];
        const numeroFila = index + 1;
        const definiciones = [
          {
            nombres: [
              `ASIGNATURA1-${numeroFila}`,
              CAMPOS_PLANTILLA_2627.asignaturas.estudiante1[index],
            ],
            descripcion: `ASIGNATURA1-${numeroFila}`,
          },
          {
            nombres: [
              `ASIGNATURA2-${numeroFila}`,
              CAMPOS_PLANTILLA_2627.asignaturas.estudiante2[index],
            ],
            descripcion: `ASIGNATURA2-${numeroFila}`,
          },
          {
            nombres: [
              `COD1-${numeroFila}`,
              `CODIGO1-${numeroFila}`,
              CAMPOS_PLANTILLA_2627.asignaturas.codigo1[index],
            ],
            descripcion: `COD1-${numeroFila}`,
          },
          {
            nombres: [
              `COD2-${numeroFila}`,
              `CODIGO2-${numeroFila}`,
              CAMPOS_PLANTILLA_2627.asignaturas.codigo2[index],
            ],
            descripcion: `COD2-${numeroFila}`,
          },
        ];
        const camposFila = definiciones.map(({ nombres, descripcion }) => (
          asignatura
            ? exigirCampoTexto(form, nombres, descripcion)
            : buscarCampo(form, nombres, PDFTextField)
        ));

        if (asignatura) {
          const [asignaturaField1, asignaturaField2, codigoField1, codigoField2] = camposFila;
          asignaturaField1.setText(String(asignatura.nombre_asignatura));
          asignaturaField2.setText(String(asignatura.nombre_asignatura));
          codigoField1.setText(String(asignatura.codigo_asignatura));
          codigoField2.setText(String(asignatura.codigo_asignatura));
        }
        camposFila.filter(Boolean).forEach((campo) => campo.enableReadOnly());
      }

      // Datos personales
      const camposEst1 = definicionesCamposEstudiante(1).map(({ nombres }) => (
        buscarCampo(form, nombres, PDFTextField)
      ));
      const camposEst2 = definicionesCamposEstudiante(2).map(({ nombres }) => (
        buscarCampo(form, nombres, PDFTextField)
      ));
      [...camposEst1, ...camposEst2].filter(Boolean).forEach(
        (campo) => campo.enableReadOnly()
      );

      if (estadoPermuta === "BORRADOR") {
        const usuario = usuarios[0];
        definicionesCamposEstudiante(1).forEach(({ nombres, descripcion }, index) => {
          if (!camposEst1[index]) {
            camposEst1[index] = exigirCampoTexto(form, nombres, descripcion);
          }
        });
        const datos = [
          tipoDocumento === "DNI" ? dni : dni.slice(0, -1),
          tipoDocumento === "DNI" ? letraDNI : dni.slice(-1),
          usuario.nombre_completo,
          domicilio,
          poblacion,
          codigoPostal,
          provincia,
          telefono,
        ];
        datos.forEach((valor, i) => camposEst1[i].setText(valor));
      } else if (estadoPermuta === "FIRMADA") {
        const usuario = usuarios[1];
        definicionesCamposEstudiante(2).forEach(({ nombres, descripcion }, index) => {
          if (!camposEst2[index]) {
            camposEst2[index] = exigirCampoTexto(form, nombres, descripcion);
          }
        });
        const datos = [
          tipoDocumento === "DNI" ? dni : dni.slice(0, -1),
          tipoDocumento === "DNI" ? letraDNI : dni.slice(-1),
          usuario.nombre_completo,
          domicilio,
          poblacion,
          codigoPostal,
          provincia,
          telefono,
        ];
        datos.forEach((valor, i) => camposEst2[i].setText(valor));
      }

      return await pdfDoc.save();
    } catch (error) {
      toast.error(t("pdf_generation.errors.generation_error"));
      console.error("Error generando el PDF:", error);
      throw error;
    }
  };

  const mostrarPDF = async () => {
    if (!validarFormulario()) {
      toast.warning(t("pdf_generation.errors.fix_errors"));
      return;
    }
    const pdfBytes = await generarPDF();
    const pdfUrl = URL.createObjectURL(
      new Blob([pdfBytes], { type: "application/pdf" })
    );
    setPdfUrl(pdfUrl);
  };

  const descargarPDF = async () => {
    if (!validarFormulario()) {
      toast.warning(t("pdf_generation.errors.fix_errors"));
      return;
    }
    const pdfBytes = await generarPDF();
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(pdfBlob, "solicitud-permutas.pdf");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.warning(t("pdf_generation.errors.select_file"));
      return;
    }
    const formData = new FormData();
    formData.append("tipo", "buzon");
    formData.append("file", file);
    try {
      const response = await subidaArchivo(formData);
      const fileId = response?.result?.fileId;
      if (!fileId) {
        toast.error(t("pdf_generation.errors.upload_error"));
        return;
      }
      if (estadoPermuta === "BORRADOR") {
        await firmarPermuta(fileId, permutaId);
      } else {
        await aceptarPermuta(fileId, permutaId);
      }
      toast.success(t("pdf_generation.errors.send_success"));
      navigate("/permutasAceptadas");
    } catch (error) {
      logError(error);
      toast.error(t("pdf_generation.errors.send_error"));
    }
  };

  const handleValidarPermuta = async () => {
    await validarSolicitudPermuta(permutaId);
    setShowModal(false);
    toast.success(t("pdf_generation.errors.validate_success"));
    navigate("/permutasAceptadas");
  };

  const handleDNIChange = (e) => {
    const value =
      tipoDocumento !== "DNI"
        ? e.target.value.toUpperCase().replace(/\s/g, "")
        : e.target.value;
    setDni(value);
    setErrors((prev) => ({
      ...prev,
      dni:
        tipoDocumento === "DNI"
          ? validarDNI(value)
          : tipoDocumento === "NIF"
            ? validarNIF(value)
            : validarTIE(value),
    }));
  };

  const handleTipoDocumentoChange = (e) => {
    setTipoDocumento(e.target.value);
    setDni("");
    setLetraDNI("");
    setErrors((prev) => ({ ...prev, dni: "", letraDNI: "" }));
  };

  const handleLetraDNIChange = (e) => {
    const value = e.target.value.toUpperCase();
    setLetraDNI(value);
    setErrors((prev) => ({ ...prev, letraDNI: validarLetraDNI(value) }));
  };

  const handleCodigoPostalChange = (e) => {
    const value = e.target.value;
    setCodigoPostal(value);
    setErrors((prev) => ({
      ...prev,
      codigoPostal: validarCodigoPostal(value),
    }));
  };

  const handleTelefonoChange = (e) => {
    const value = e.target.value;
    setTelefono(value);
    setErrors((prev) => ({ ...prev, telefono: validarTelefono(value) }));
  };

  const validarFormulario = () => {
    const nuevoErrors = {
      dni:
        tipoDocumento === "DNI"
          ? validarDNI(dni)
          : tipoDocumento === "NIF"
            ? validarNIF(dni)
            : validarTIE(dni),
      letraDNI: tipoDocumento === "DNI" ? validarLetraDNI(letraDNI) : "",
      domicilio: validarCampoObligatorio(domicilio, "domicilio"),
      poblacion: validarCampoObligatorio(poblacion, "población"),
      codigoPostal: validarCodigoPostal(codigoPostal),
      provincia: validarCampoObligatorio(provincia, "provincia"),
      telefono: validarTelefono(telefono),
    };
    setErrors(nuevoErrors);
    // Comprobar si hay algún error
    return !Object.values(nuevoErrors).some((error) => error !== "");
  };

  return (
    <div className="page-container">
      <div className="content-wrap">
        <div className="page-header">
          <h1 className="page-title">{t("pdf_generation.title")}</h1>
          <p className="page-subtitle">
            {t("pdf_generation.description")}
          </p>
          <p style={{ maxWidth: '800px', margin: '15px auto', color: 'var(--text-secondary)' }}>
            {t("pdf_generation.instructions_1")}
          </p>
          <p style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-secondary)' }}>
            {t("pdf_generation.instructions_2")}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>

          {/* Columna Izquierda: Formulario */}
          <div className="user-card">
            <div className="form-group">
              <label className="form-label">
                {t("pdf_generation.labels.document_type")}
              </label>
              <select
                value={tipoDocumento}
                onChange={handleTipoDocumentoChange}
                disabled={estadoPermuta === "ACEPTADA" || estadoPermuta === "VALIDADA"}
                className="form-input"
              >
                <option value="DNI">DNI</option>
                <option value="NIF">NIF</option>
                <option value="TIE">TIE</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
              <div style={{ flex: 2 }} className="form-group">
                <label className="form-label">
                  {t(`pdf_generation.labels.${tipoDocumento.toLowerCase()}`)}
                </label>
                <input
                  type="text"
                  disabled={estadoPermuta === "ACEPTADA" || estadoPermuta === "VALIDADA"}
                  value={dni}
                  onChange={handleDNIChange}
                  maxLength={tipoDocumento === "DNI" ? 8 : 9}
                  className={`form-input ${errors.dni ? "input-error" : ""}`}
                  style={{ borderColor: errors.dni ? 'var(--danger-color)' : '' }}
                />
                {errors.dni && <span style={{ color: 'var(--danger-color)', fontSize: '0.85rem' }}>{errors.dni}</span>}
              </div>
              {tipoDocumento === "DNI" && <div style={{ flex: 1 }} className="form-group">
                <label className="form-label">{t("pdf_generation.labels.dni_letter")}</label>
                <input
                  type="text"
                  disabled={estadoPermuta === "ACEPTADA" || estadoPermuta === "VALIDADA"}
                  value={letraDNI}
                  onChange={handleLetraDNIChange}
                  maxLength="1"
                  className={`form-input ${errors.letraDNI ? "input-error" : ""}`}
                  style={{ borderColor: errors.letraDNI ? 'var(--danger-color)' : '' }}
                />
                {errors.letraDNI && <span style={{ color: 'var(--danger-color)', fontSize: '0.85rem' }}>{errors.letraDNI}</span>}
              </div>}
            </div>

            <div className="form-group">
              <label className="form-label">{t("pdf_generation.labels.address")}</label>
              <input
                type="text"
                disabled={estadoPermuta === "ACEPTADA" || estadoPermuta === "VALIDADA"}
                value={domicilio}
                onChange={(e) => {
                  setDomicilio(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    domicilio: validarCampoObligatorio(e.target.value, "domicilio"),
                  }));
                }}
                className={`form-input ${errors.domicilio ? "input-error" : ""}`}
                style={{ borderColor: errors.domicilio ? 'var(--danger-color)' : '' }}
              />
              {errors.domicilio && <span style={{ color: 'var(--danger-color)', fontSize: '0.85rem' }}>{errors.domicilio}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">{t("pdf_generation.labels.city")}</label>
              <input
                type="text"
                disabled={estadoPermuta === "ACEPTADA" || estadoPermuta === "VALIDADA"}
                value={poblacion}
                onChange={(e) => {
                  setPoblacion(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    poblacion: validarCampoObligatorio(e.target.value, "población"),
                  }));
                }}
                className={`form-input ${errors.poblacion ? "input-error" : ""}`}
                style={{ borderColor: errors.poblacion ? 'var(--danger-color)' : '' }}
              />
              {errors.poblacion && <span style={{ color: 'var(--danger-color)', fontSize: '0.85rem' }}>{errors.poblacion}</span>}
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">{t("pdf_generation.labels.zip_code")}</label>
                <input
                  type="text"
                  disabled={estadoPermuta === "ACEPTADA" || estadoPermuta === "VALIDADA"}
                  value={codigoPostal}
                  onChange={handleCodigoPostalChange}
                  className={`form-input ${errors.codigoPostal ? "input-error" : ""}`}
                  style={{ borderColor: errors.codigoPostal ? 'var(--danger-color)' : '' }}
                />
                {errors.codigoPostal && <span style={{ color: 'var(--danger-color)', fontSize: '0.85rem' }}>{errors.codigoPostal}</span>}
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">{t("pdf_generation.labels.province")}</label>
                <input
                  type="text"
                  disabled={estadoPermuta === "ACEPTADA" || estadoPermuta === "VALIDADA"}
                  value={provincia}
                  onChange={(e) => {
                    setProvincia(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      provincia: validarCampoObligatorio(e.target.value, "provincia"),
                    }));
                  }}
                  className={`form-input ${errors.provincia ? "input-error" : ""}`}
                  style={{ borderColor: errors.provincia ? 'var(--danger-color)' : '' }}
                />
                {errors.provincia && <span style={{ color: 'var(--danger-color)', fontSize: '0.85rem' }}>{errors.provincia}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t("pdf_generation.labels.phone")}</label>
              <input
                type="text"
                disabled={estadoPermuta === "ACEPTADA" || estadoPermuta === "VALIDADA"}
                value={telefono}
                onChange={handleTelefonoChange}
                className={`form-input ${errors.telefono ? "input-error" : ""}`}
                style={{ borderColor: errors.telefono ? 'var(--danger-color)' : '' }}
              />
              {errors.telefono && <span style={{ color: 'var(--danger-color)', fontSize: '0.85rem' }}>{errors.telefono}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
              {estadoPermuta !== "ACEPTADA" && estadoPermuta !== "VALIDADA" && (
                <button className="btn btn-primary" onClick={mostrarPDF} disabled={cargandoDatos || Boolean(errorCarga)}>
                  {t("pdf_generation.buttons.visualize")}
                </button>
              )}
              <button className="btn btn-secondary" onClick={descargarPDF} disabled={cargandoDatos || Boolean(errorCarga)} style={{ width: '100%', backgroundColor: '#6c757d', color: 'white' }}>
                {t("pdf_generation.buttons.download")}
              </button>
            </div>

            {cargandoDatos && (
              <div className="user-loading" role="status">
                {t("pdf_generation.loading")}
              </div>
            )}
            {errorCarga && <div className="user-error" role="alert">{errorCarga}</div>}

            {estadoPermuta !== "ACEPTADA" && estadoPermuta !== "VALIDADA" && (
              <div className="file-upload-wrapper" style={{ marginTop: '20px', padding: '20px' }}>
                <input
                  type="file"
                  id="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  style={{ marginBottom: '10px', width: '100%' }}
                />
                <button className="btn btn-success btn-full" onClick={handleUpload}>
                  {t("pdf_generation.buttons.upload")}
                </button>
              </div>
            )}

            {estadoPermuta === "ACEPTADA" && estadoPermuta !== "VALIDADA" && (
              <button
                className="btn btn-warning btn-full"
                style={{ marginTop: '20px', backgroundColor: 'var(--warning-color)', color: 'white' }}
                onClick={() => setShowModal(true)}
              >
                {t("pdf_generation.buttons.validate")}
              </button>
            )}
          </div>

          {/* Columna Derecha: PDF Preview */}
          <div className="user-card" style={{ display: 'flex', flexDirection: 'column', height: 'fit-content', minHeight: '600px', padding: '0', overflow: 'hidden' }}>
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                style={{ width: '100%', height: '700px', border: 'none' }}
                title={t("pdf_generation.preview_title")}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', backgroundColor: '#f8f9fa', color: '#6c757d' }}>
                <p>{t("pdf_generation.buttons.visualize")}...</p>
              </div>
            )}
          </div>

        </div>

        {showModal && (
          <Modal
            title={t("pdf_generation.modal.title")}
            message={t("pdf_generation.modal.message")}
            onConfirm={handleValidarPermuta}
            onCancel={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
}
