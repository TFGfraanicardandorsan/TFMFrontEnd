import { useState, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { obtenerPlantillaPermuta } from "../services/subidaArchivos.js"; 
import { verListaPermutas } from "../services/permuta.js";
import Navbar from "./navbar";
import Footer from "./footer";
import "../styles/generacionPDF-style.css";
import { dayValue, monthValue, yearValue } from "../lib/generadorFechas.js"; 

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
  const iframeRef = useRef(null);

  useEffect(() => {
    const obtenerListaPermutas = async () => {
      try {
        const data = await verListaPermutas();
        setUsuarios(data.result.result[0].usuarios);
        setPermutas(data.result.result[0].permutas);
      } catch (error) {
        console.error("Error al obtener la lista de permutas:", error);
      }
    };
    obtenerListaPermutas();
  }, []);
  
  const generarPDF = async () => {
    try {
      const pdfDoc = await PDFDocument.load(await obtenerPlantillaPermuta());
      const form = pdfDoc.getForm();
      // Campos de grado
      const grado1 = form.getCheckBox("GII-IS");
      const grado2 = form.getCheckBox("GII-IC");
      const grado3 = form.getCheckBox("GII-TI");
      const grado4 = form.getCheckBox("GISA");
      // Cabecera para alumno 1
      const dni1 = form.getTextField("DNI1");
      const letra1 = form.getTextField("LETRA1");
      const nombre1 = form.getTextField("NOMBRE1");
      const domicilio1 = form.getTextField("DOMICILIO1");
      const poblacion1 = form.getTextField("POBLACION1");
      const codigoPostal1 = form.getTextField("COD-POSTAL1");
      const provincia1 = form.getTextField("PROVINCIA1");
      const telefono1 = form.getTextField("TELEFONO1");
      // Cabecera para alumno 2
      const dni2 = form.getTextField("DNI2");
      const letra2 = form.getTextField("LETRA2");
      const nombre2 = form.getTextField("NOMBRE2");
      const domicilio2 = form.getTextField("DOMICILIO2");
      const poblacion2 = form.getTextField("POBLACION2");
      const codigoPostal2 = form.getTextField("COD-POSTAL2");
      const provincia2 = form.getTextField("PROVINCIA2");
      const telefono2 = form.getTextField("TELEFONO2");
      // Fecha Firma
      const day = form.getTextField("DAY");
      const month = form.getTextField("MONTH");
      const year = form.getTextField("YEAR");

      // Asignaturas y códigos
      permutas.forEach((asignatura, index) => {
        const asignaturaField1 = form.getTextField(`ASIGNATURA1-${index + 1}`);
        const asignaturaField2 = form.getTextField(`ASIGNATURA2-${index + 1}`);
        const codigoField1 = form.getTextField(`COD1-${index + 1}`);
        const codigoField2 = form.getTextField(`COD2-${index + 1}`);
        asignaturaField1.setText(asignatura.nombre_asignatura);
        asignaturaField2.setText(asignatura.nombre_asignatura);
        codigoField1.setText(asignatura.codigo_asignatura);
        codigoField2.setText(asignatura.codigo_asignatura);
        asignaturaField1.enableReadOnly();
        asignaturaField2.enableReadOnly();
        codigoField1.enableReadOnly();
        codigoField2.enableReadOnly();
      });

      // Grado de los alumnos
      switch (usuarios[0].estudio) {
        case "GII-IS": grado1.check();break;
        case "GII-IC": grado2.check();break;
        case "GII-TI": grado3.check();break;
        case "GISA":   grado4.check();break;
      }
      const cabeceraAlumno1Rellena = dni1.getText()?.trim() !== "";
      if (!cabeceraAlumno1Rellena) {
      // Si la cabecera del alumno 1 no está rellena, se rellenan los campos con los datos del primer usuario
      dni1.setText(dni);
      letra1.setText(letraDNI);
      nombre1.setText(usuarios[0].nombre_completo);
      domicilio1.setText(domicilio);
      poblacion1.setText(poblacion);
      codigoPostal1.setText(codigoPostal);
      provincia1.setText(provincia);
      telefono1.setText(telefono);
      // Bloquear la cabecera del alumno 1
      [dni1, letra1, nombre1, domicilio1, poblacion1, codigoPostal1, provincia1, telefono1].forEach(field => field.enableReadOnly());
      } else {
        // Usuario 2 rellena
      dni2.setText(dni);
      letra2.setText(letraDNI);
      nombre2.setText(usuarios[1].nombre_completo);
      domicilio2.setText(domicilio);
      poblacion2.setText(poblacion);
      codigoPostal2.setText(codigoPostal);
      provincia2.setText(provincia);
      telefono2.setText(telefono);
      // Bloquear la cabecera del alumno 2
      [dni2, letra2, nombre2, domicilio2, poblacion2, codigoPostal2, provincia2, telefono2].forEach(field => field.enableReadOnly());
      }
      // Fecha de firma siempre bloqueada
      day.setText(dayValue);
      month.setText(monthValue);
      year.setText(yearValue);
      [day, month, year].forEach(field => field.enableReadOnly());

      // Bloquear el grado de los alumnos
      [grado1, grado2, grado3, grado4].forEach(grado => grado.enableReadOnly());
     
      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
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
    const pdfBytes = await enviarPDF();
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(pdfBlob, "solicitud-permutas.pdf");
  };
  return (
    <>
      <Navbar />
      <br />
      <h1>Generación documentación permuta</h1>
      <div className="container">
        <div className="formulario">
          <div className="asociar">
            <label>
              DNI:
              <input
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
              />
            </label>
            <label>
              Letra DNI:
              <input
                type="text"
                value={letraDNI}
                onChange={(e) => setLetraDNI(e.target.value)}
              />
            </label>
          </div>
          <label>
            Domicilio:
            <input
              type="text"
              value={domicilio}
              onChange={(e) => setDomicilio(e.target.value)}
            />
          </label>
          <label>
            Población:
            <input
              type="text"
              value={poblacion}
              onChange={(e) => setPoblacion(e.target.value)}
            />
          </label>
          <div className="asociar">
            <label>
              Código Postal:
              <input
                type="text"
                value={codigoPostal}
                onChange={(e) => setCodigoPostal(e.target.value)}
              />
            </label>
            <label>
              Provincia:
              <input
                type="text"
                value={provincia}
                onChange={(e) => setProvincia(e.target.value)}
              />
            </label>
          </div>
          <label>
            Teléfono:
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
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
      <Footer />
    </>
  );
}
