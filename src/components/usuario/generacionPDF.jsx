import { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
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
import "../styles/generacionPDF-style.css";
import { dayValue, monthValue, yearValue } from "../../lib/generadorFechas.js";
import {
  validarDNI,
  validarLetraDNI,
  validarCampoObligatorio,
  validarCodigoPostal,
  validarTelefono,
} from "../../lib/validadores.js";
import Modal from "./Modal.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { logError } from "../../lib/logger.js";

export default function GeneracionPDF() {
  const [dni, setDni] = useState("");
  const [letraDNI, setLetraDNI] = useState("");
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
  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const lista = await verListaPermutas();
        setUsuarios(lista.result.result[0].usuarios);
        setPermutas(lista.result.result[0].permutas);

        const idsPermutas = lista.result.result[0].permutas.map(
          (permuta) => permuta.permuta_id
        );
        const permuta = await listarPermutas(idsPermutas);
        const estado = permuta?.result?.result[0]?.estado;
        const fileId = permuta?.result?.result[0]?.archivo;
        setPermutaId(permuta?.result?.result[0]?.id);

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
      }
    };
    cargarDatos();
  }, []);

  const generarPDF = async () => {
    try {
      const existingPdfBytes =
        estadoPermuta !== "BORRADOR" && pdfExistente
          ? pdfExistente
          : await obtenerPlantillaPermuta();

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const form = pdfDoc.getForm();

      // Grado (bloqueado siempre)
      const grado1 = form.getCheckBox("GII-IS");
      const grado2 = form.getCheckBox("GII-IC");
      const grado3 = form.getCheckBox("GII-TI");
      const grado4 = form.getCheckBox("GISA");
      [grado1, grado2, grado3, grado4].forEach((g) => g.enableReadOnly());

      const estudio = usuarios[0]?.estudio;
      switch (estudio) {
        case "GII-IS":
          grado1.check();
          break;
        case "GII-IC":
          grado2.check();
          break;
        case "GII-TI":
          grado3.check();
          break;
        case "GISA":
          grado4.check();
          break;
      }

      // Fechas (bloqueadas siempre)
      const day = form.getTextField("DAY");
      const month = form.getTextField("MONTH");
      const year = form.getTextField("YEAR");
      day.setText(dayValue);
      month.setText(monthValue);
      year.setText(yearValue);
      [day, month, year].forEach((f) => f.enableReadOnly());

      // Asignaturas (bloqueadas siempre)
      for (let index = 0; index < 16; index++) {
        const asignatura = permutas[index];
        const asignaturaField1 = form.getTextField(`ASIGNATURA1-${index + 1}`);
        const asignaturaField2 = form.getTextField(`ASIGNATURA2-${index + 1}`);
        const codigoField1 = form.getTextField(`COD1-${index + 1}`);
        const codigoField2 = form.getTextField(`COD2-${index + 1}`);

        if (asignatura) {
          asignaturaField1.setText(String(asignatura.nombre_asignatura));
          asignaturaField2.setText(String(asignatura.nombre_asignatura));
          codigoField1.setText(String(asignatura.codigo_asignatura));
          codigoField2.setText(String(asignatura.codigo_asignatura));
        }
        [
          asignaturaField1,
          asignaturaField2,
          codigoField1,
          codigoField2,
        ].forEach((f) => f.enableReadOnly());
      }

      // Datos personales
      const camposEst1 = [
        form.getTextField("DNI1"),
        form.getTextField("LETRA1"),
        form.getTextField("NOMBRE1"),
        form.getTextField("DOMICILIO1"),
        form.getTextField("POBLACION1"),
        form.getTextField("COD-POSTAL1"),
        form.getTextField("PROVINCIA1"),
        form.getTextField("TELEFONO1"),
      ];
      const camposEst2 = [
        form.getTextField("DNI2"),
        form.getTextField("LETRA2"),
        form.getTextField("NOMBRE2"),
        form.getTextField("DOMICILIO2"),
        form.getTextField("POBLACION2"),
        form.getTextField("COD-POSTAL2"),
        form.getTextField("PROVINCIA2"),
        form.getTextField("TELEFONO2"),
      ];

      [...camposEst1, ...camposEst2].forEach((f) => f.enableReadOnly());

      if (estadoPermuta === "BORRADOR") {
        const usuario = usuarios[0];
        const datos = [
          dni,
          letraDNI,
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
        const datos = [
          dni,
          letraDNI,
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
      toast.error("Error generando el PDF");
      logError(error)
    }
  };

  const mostrarPDF = async () => {
    if (!validarFormulario()) {
      toast.warning("Por favor, corrige los errores en el formulario");
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
      toast.warning("Por favor, corrige los errores en el formulario");
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
      toast.warning("Por favor, selecciona un archivo para subir.");
      return;
    }
    const formData = new FormData();
    formData.append("tipo", "buzon");
    formData.append("file", file);
    try {
      const response = await subidaArchivo(formData);
      const fileId = response?.result?.fileId;
      if (!fileId) {
        toast.error("Error al subir el archivo PDF.");
        return;
      }
      if (estadoPermuta === "BORRADOR") {
        await firmarPermuta(fileId, permutaId);
      } else {
        await aceptarPermuta(fileId, permutaId);
      }
      toast.success("Se ha enviado el PDF correctamente.");
      navigate("/permutasAceptadas");
    } catch (error) {
      logError(error);
      toast.error("Error al enviar el PDF");
    }
  };

  const handleValidarPermuta = async () => {
    await validarSolicitudPermuta(permutaId);
    setShowModal(false);
    toast.success("La permuta ha sido validada correctamente.");
    navigate("/permutasAceptadas");
  };

  const handleDNIChange = (e) => {
    const value = e.target.value;
    setDni(value);
    setErrors((prev) => ({ ...prev, dni: validarDNI(value) }));
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
      dni: validarDNI(dni),
      letraDNI: validarLetraDNI(letraDNI),
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
    <>
      <br />
      <h1>Generación documentación permuta</h1>
      Este formulario permite generar la documentación necesaria para solicitar una permuta de asignaturas. Por favor, completa todos los campos obligatorios y asegúrate de que la información es correcta antes de enviar el formulario.
      Una vez rellenes el formulario, podrás descargar un PDF con la solicitud de permuta. Este PDF deberá ser firmado y enviado al sistema para que tu compañero pueda rellenar sus datos.
      Cuando tu compañero firme el PDF, podrás descargarlo y enviarlo a la administración.
      <br />
      <div className="permuta-container">
        <div className="permuta-formulario">
          <div className="permuta-asociar">
            <label className="permuta-label">
              DNI:
              <input
                type="text"
                disabled={
                  estadoPermuta === "ACEPTADA" || estadoPermuta === "VALIDADA"
                }
                value={dni}
                onChange={handleDNIChange}
                className={`permuta-input ${
                  errors.dni ? "permuta-input-error" : ""
                }`}
              />
              {errors.dni && (
                <span className="permuta-error-message">{errors.dni}</span>
              )}
            </label>
            <label className="permuta-label">
              Letra DNI:
              <input
                type="text"
                disabled={
                  estadoPermuta === "ACEPTADA" || estadoPermuta === "VALIDADA"
                }
                value={letraDNI}
                onChange={handleLetraDNIChange}
                maxLength="1"
                className={`permuta-input ${
                  errors.letraDNI ? "permuta-input-error" : ""
                }`}
              />
              {errors.letraDNI && (
                <span className="permuta-error-message">{errors.letraDNI}</span>
              )}
            </label>
          </div>

          <label className="permuta-label">
            Domicilio:
            <input
              type="text"
              disabled={
                estadoPermuta === "ACEPTADA" || estadoPermuta === "VALIDADA"
              }
              value={domicilio}
              onChange={(e) => {
                setDomicilio(e.target.value);
                setErrors((prev) => ({
                  ...prev,
                  domicilio: validarCampoObligatorio(
                    e.target.value,
                    "domicilio"
                  ),
                }));
              }}
              className={`permuta-input ${
                errors.domicilio ? "permuta-input-error" : ""
              }`}
            />
            {errors.domicilio && (
              <span className="permuta-error-message">{errors.domicilio}</span>
            )}
          </label>

          <label className="permuta-label">
            Población:
            <input
              type="text"
              disabled={
                estadoPermuta === "ACEPTADA" || estadoPermuta === "VALIDADA"
              }
              value={poblacion}
              onChange={(e) => {
                setPoblacion(e.target.value);
                setErrors((prev) => ({
                  ...prev,
                  poblacion: validarCampoObligatorio(
                    e.target.value,
                    "población"
                  ),
                }));
              }}
              className={`permuta-input ${
                errors.poblacion ? "permuta-input-error" : ""
              }`}
            />
            {errors.poblacion && (
              <span className="permuta-error-message">{errors.poblacion}</span>
            )}
          </label>

          <div className="permuta-asociar">
            <label className="permuta-label">
              Código Postal:
              <input
                type="text"
                disabled={
                  estadoPermuta === "ACEPTADA" || estadoPermuta === "VALIDADA"
                }
                value={codigoPostal}
                onChange={handleCodigoPostalChange}
                className={`permuta-input ${
                  errors.codigoPostal ? "permuta-input-error" : ""
                }`}
              />
              {errors.codigoPostal && (
                <span className="permuta-error-message">
                  {errors.codigoPostal}
                </span>
              )}
            </label>
            <label className="permuta-label">
              Provincia:
              <input
                type="text"
                disabled={
                  estadoPermuta === "ACEPTADA" || estadoPermuta === "VALIDADA"
                }
                value={provincia}
                onChange={(e) => {
                  setProvincia(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    provincia: validarCampoObligatorio(
                      e.target.value,
                      "provincia"
                    ),
                  }));
                }}
                className={`permuta-input ${
                  errors.provincia ? "permuta-input-error" : ""
                }`}
              />
              {errors.provincia && (
                <span className="permuta-error-message">
                  {errors.provincia}
                </span>
              )}
            </label>
          </div>

          <label className="permuta-label">
            Teléfono:
            <input
              type="text"
              disabled={
                estadoPermuta === "ACEPTADA" || estadoPermuta === "VALIDADA"
              }
              value={telefono}
              onChange={handleTelefonoChange}
              className={`permuta-input ${
                errors.telefono ? "permuta-input-error" : ""
              }`}
            />
            {errors.telefono && (
              <span className="permuta-error-message">{errors.telefono}</span>
            )}
          </label>

          <div className="permuta-botones">
            {estadoPermuta !== "ACEPTADA" && estadoPermuta !== "VALIDADA" && (
              <button className="permuta-button" onClick={mostrarPDF}>
                Visualizar
              </button>
            )}
            <button className="permuta-button" onClick={descargarPDF}>
              Descargar
            </button>
          </div>

          {estadoPermuta !== "ACEPTADA" && estadoPermuta !== "VALIDADA" && (
            <div className="permuta-boton-enviar">
              <input
                type="file"
                id="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
              <button className="permuta-button" onClick={handleUpload}>
                Enviar PDF
              </button>
            </div>
          )}
          {estadoPermuta === "ACEPTADA" && estadoPermuta !== "VALIDADA" && (
            <button
              className="permuta-button-validar"
              onClick={() => setShowModal(true)}
            >
              Validar
            </button>
          )}

          {showModal && (
            <Modal
              title="Validar Permuta"
              message={`Recuerde que las solicitudes deberán remitirse de forma telemática (requiere certificado digital de la FNMT), a través del Registro de la Administración General del Estado, indicando como destinatario (usar buscador) “Universidad de Sevilla” y 
              poniendo en asunto el nombre del centro "Para E.T.S. de Ingeniería Informática". En caso contrario el trámite NO será registrado por la escuela y no se podrá realizar la permuta.`}
              onConfirm={handleValidarPermuta}
              onCancel={() => setShowModal(false)}
            />
          )}
        </div>
        <div className="permuta-pdf-container">
          {pdfUrl && <iframe className="pdf-iframe" src={pdfUrl} />}
        </div>
      </div>
      <div style={{ height: "80px" }} />
    </>
  );
}
