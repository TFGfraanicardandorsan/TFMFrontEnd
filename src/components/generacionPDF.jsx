import { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import {
  obtenerPlantillaPermuta,
  subidaArchivo,
  servirArchivo,
} from "../services/subidaArchivos.js";
import {
  verListaPermutas,
  listarPermutas,
  firmarPermuta,
  aceptarPermuta,
} from "../services/permuta.js";
import "../styles/generacionPDF-style.css";
import { dayValue, monthValue, yearValue } from "../lib/generadorFechas.js";
import {
  validarDNI,
  validarLetraDNI,
  validarCampoObligatorio,
  validarCodigoPostal,
  validarTelefono,
} from "../lib/validadores.js";

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

          if (estado === "ACEPTADA") {
            const pdfUrl = URL.createObjectURL(
              new Blob([bytes], { type: "application/pdf" })
            );
            setPdfUrl(pdfUrl);
          }
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
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
          asignaturaField1.setText(asignatura.nombre_asignatura);
          asignaturaField2.setText(asignatura.nombre_asignatura);
          codigoField1.setText(asignatura.codigo_asignatura);
          codigoField2.setText(asignatura.codigo_asignatura);
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
    } catch (e) {
      console.error("Error generando PDF:", e);
    }
  };

  const mostrarPDF = async () => {
    if (!validarFormulario()) {
      alert("Por favor, corrige los errores en el formulario");
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
      alert("Por favor, corrige los errores en el formulario");
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
      alert("Por favor, selecciona un archivo para subir.");
      return;
    }
    const formData = new FormData();
    formData.append("tipo", "buzon");
    formData.append("file", file);
    try {
      const response = await subidaArchivo(formData);
      const fileId = response?.result?.fileId;
      if (!fileId) {
        alert("Error al subir el archivo PDF.");
        return;
      }
      if (estadoPermuta === "BORRADOR") {
        await firmarPermuta(fileId, permutaId);
      } else {
        await aceptarPermuta(fileId, permutaId);
      }
      alert("PDF enviado correctamente.");
    } catch (error) {
      console.error("Error al enviar el PDF:", error);
      alert("Error al enviar el PDF");
    }
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
      <div className="permuta-container">
        <div className="permuta-formulario">
          <div className="permuta-asociar">
            <label className="permuta-label">
              DNI:
              <input
                type="text"
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
            <button className="permuta-button" onClick={mostrarPDF}>
              Visualizar
            </button>
            <button className="permuta-button" onClick={descargarPDF}>
              Descargar
            </button>
          </div>

          <div className="permuta-boton-enviar">
            <input
              disabled={estadoPermuta === "ACEPTADA"}
              type="file"
              id="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
            <button
              className="permuta-button"
              disabled={estadoPermuta === "ACEPTADA"}
              onClick={handleUpload}
            >
              Enviar PDF
            </button>
          </div>
        </div>

        <div className="permuta-pdf-container">
          {pdfUrl && (
            <object
              data={pdfUrl}
              type="application/pdf"
              width="100%"
              height="100%" 
              style={{ border: "none", display: "block", objectFit: "contain" }}
            >
              <p>
                No se puede mostrar el PDF. <a href={pdfUrl}>Descargar</a>
              </p>
            </object>
          )}
        </div>
      </div>
    </>
  );
}
