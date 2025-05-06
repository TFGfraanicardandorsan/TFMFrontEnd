import { useState, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { obtenerPlantillaPermuta,subidaArchivo,servirArchivo } from "../services/subidaArchivos.js";
import { verListaPermutas, listarPermutas, firmarPermuta, aceptarPermuta } from "../services/permuta.js";
import "../styles/generacionPDF-style.css";
import { dayValue,monthValue,yearValue } from "../lib/generadorFechas.js";

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
  const iframeRef = useRef(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const lista = await verListaPermutas();
        setUsuarios(lista.result.result[0].usuarios);
        setPermutas(lista.result.result[0].permutas);

        const idsPermutas = lista.result.result[0].permutas.map((permuta) => permuta.permuta_id);
        const permuta = await listarPermutas(idsPermutas);
        const estado = permuta?.result?.result[0]?.estado;
        const fileId = permuta?.result?.result[0]?.archivo;
        if (estado && fileId) {
          setEstadoPermuta(estado);
          setPermutaId(permuta?.result?.result[0]?.id)
          const bytes = await servirArchivo("buzon", fileId);
          setPdfExistente(bytes);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    cargarDatos();
  }, []);

  const generarPDF = async () => {
    try {
      const existingPdfBytes = estadoPermuta === "FIRMADA" && pdfExistente ? pdfExistente : await obtenerPlantillaPermuta();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const form = pdfDoc.getForm();
      const grado1 = form.getCheckBox("GII-IS");
      const grado2 = form.getCheckBox("GII-IC");
      const grado3 = form.getCheckBox("GII-TI");
      const grado4 = form.getCheckBox("GISA");
      const dni1 = form.getTextField("DNI1");
      const letra1 = form.getTextField("LETRA1");
      const nombre1 = form.getTextField("NOMBRE1");
      const domicilio1 = form.getTextField("DOMICILIO1");
      const poblacion1 = form.getTextField("POBLACION1");
      const codigoPostal1 = form.getTextField("COD-POSTAL1");
      const provincia1 = form.getTextField("PROVINCIA1");
      const telefono1 = form.getTextField("TELEFONO1");

      const dni2 = form.getTextField("DNI2");
      const letra2 = form.getTextField("LETRA2");
      const nombre2 = form.getTextField("NOMBRE2");
      const domicilio2 = form.getTextField("DOMICILIO2");
      const poblacion2 = form.getTextField("POBLACION2");
      const codigoPostal2 = form.getTextField("COD-POSTAL2");
      const provincia2 = form.getTextField("PROVINCIA2");
      const telefono2 = form.getTextField("TELEFONO2");

      const day = form.getTextField("DAY");
      const month = form.getTextField("MONTH");
      const year = form.getTextField("YEAR");

      for (let index = 0; index < 16; index++) {
        const asignatura = permutas[index];
        const asignaturaField1 = form.getTextField(`ASIGNATURA1-${index + 1}`);
        const asignaturaField2 = form.getTextField(`ASIGNATURA2-${index + 1}`);
        const codigoField1 = form.getTextField(`COD1-${index + 1}`);
        const codigoField2 = form.getTextField(`COD2-${index + 1}`);
        // Rellenar si hay datos
        if (asignatura) {
          asignaturaField1.setText(asignatura.nombre_asignatura);
          asignaturaField2.setText(asignatura.nombre_asignatura);
          codigoField1.setText(asignatura.codigo_asignatura);
          codigoField2.setText(asignatura.codigo_asignatura);
        }
        // Siempre bloquear
        asignaturaField1.enableReadOnly();
        asignaturaField2.enableReadOnly();
        codigoField1.enableReadOnly();
        codigoField2.enableReadOnly();
      }
      const usuario = estadoPermuta === "BORRADOR" ? usuarios[0] : usuarios[1];

      const campos = estadoPermuta === "BORRADOR"
          ? [dni1, letra1, nombre1, domicilio1, poblacion1, codigoPostal1, provincia1, telefono1]
          : [dni2, letra2, nombre2, domicilio2, poblacion2, codigoPostal2, provincia2, telefono2];

      campos[0].setText(dni);
      campos[1].setText(letraDNI);
      campos[2].setText(usuario.nombre_completo);
      campos[3].setText(domicilio);
      campos[4].setText(poblacion);
      campos[5].setText(codigoPostal);
      campos[6].setText(provincia);
      campos[7].setText(telefono);
      campos.forEach((f) => f.enableReadOnly());

      switch (usuario.estudio) {
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
      [grado1, grado2, grado3, grado4].forEach((g) => g.enableReadOnly());

      day.setText(dayValue);
      month.setText(monthValue);
      year.setText(yearValue);
      [day, month, year].forEach((f) => f.enableReadOnly());
      return await pdfDoc.save();
    } catch (e) {
      console.error(e);
    }
  };

  const mostrarPDF = async () => {
    const pdfBytes = await generarPDF();
    const pdfUrl = URL.createObjectURL(new Blob([pdfBytes], { type: "application/pdf" }));
    iframeRef.current.src = pdfUrl;
  };

  const descargarPDF = async () => {
    const pdfBytes = await generarPDF();
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(pdfBlob, "solicitud-permutas.pdf");
  };

  const enviarPDF = async () => {
    try {
      const pdfBytes = await generarPDF();
      const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
      const formData = new FormData();
      formData.append("tipo", "buzon");
      formData.append("file", pdfBlob, "solicitud-permutas.pdf");
      const response = await subidaArchivo(formData);
      const fileId = response?.result?.fileId;
      if (!fileId) {
        alert("Error al subir el archivo PDF.");
        return;
      }
      if (estadoPermuta === "FIRMADA") {
        await aceptarPermuta(fileId,permutaId)
      } else {
        await firmarPermuta(fileId,permutaId)
      }
      alert("PDF enviado correctamente.");
    } catch (error) {
      console.error("Error al enviar el PDF:", error);
      alert("Error al enviar el PDF");
    }
  };

  return (
    <>
      <br />
      <h1>Generación documentación permuta</h1>
      <div className="container">
        <div className="formulario">
          <div className="asociar">
            <label>
              DNI:
              <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} />
            </label>
            <label>
              Letra DNI:
              <input type="text" value={letraDNI} onChange={(e) => setLetraDNI(e.target.value)} />
            </label>
          </div>
          <label>
            Domicilio:
            <input type="text" value={domicilio} onChange={(e) => setDomicilio(e.target.value)} />
          </label>
          <label>
            Población:
            <input type="text" value={poblacion} onChange={(e) => setPoblacion(e.target.value)} />
          </label>
          <div className="asociar">
            <label>
              Código Postal:
              <input type="text" value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} />
            </label>
            <label>
              Provincia:
              <input type="text" value={provincia} onChange={(e) => setProvincia(e.target.value)} />
            </label>
          </div>
          <label>
            Teléfono:
            <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </label>
          <br />
          <div className="asociarBoton">
            <button onClick={mostrarPDF}>Visualizar</button>
            <button onClick={descargarPDF}>Descargar</button>
            <button onClick={enviarPDF}>Enviar</button>
          </div>
        </div>
        <div className="pdf-container">
          <iframe ref={iframeRef} title="PDF generado"></iframe>
        </div>
      </div>
    </>
  );
}