import { useState, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import plantillaPDF from "../assets/solicitud-permutas-2024-25V2.pdf";
import Navbar from "./navbar";
import Footer from "./footer";
import "../styles/generacionPDF-style.css";
import { obtenerAsignaturasUsuario } from "../services/asignaturas.js";
import { obtenerDatosUsuario } from "../services/usuario"; 
import { dayValue, monthValue, yearValue } from "../lib/generadorFechas.js"; 

export default function GeneracionPDF() {
  const [grado, setGrado] = useState("");
  const [dni, setDni] = useState("");
  const [letraDNI, setLetraDNI] = useState("");
  const [nombre, setNombre] = useState("");
  const [domicilio, setDomicilio] = useState("");
  const [poblacion, setPoblacion] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [provincia, setProvincia] = useState("");
  const [telefono, setTelefono] = useState("");
  const [asignaturas, setAsignaturas] = useState("");
  const iframeRef = useRef(null);

  useEffect(() => {
    const obtenerAsignaturaUsuario = async () => {
      try {
        const data = await obtenerAsignaturasUsuario();
        setAsignaturas(data.result.result);
      } catch (error) {
        console.error("Error al obtener las asignaturas del usuario:", error);
      }
    };
    obtenerAsignaturaUsuario();
  }, []);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const data = await obtenerDatosUsuario();
        setGrado(data.result.result.titulacion);
        setNombre(data.result.result.nombre_completo);
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
      }
    };
    obtenerDatos();
  }, []);


  const generarPDF = async () => {
    try {
      const existingPdfBytes = await fetch(plantillaPDF).then((res) =>
        res.arrayBuffer()
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const form = pdfDoc.getForm();

      const grado1 = form.getCheckBox("GII-IS");
      const grado2 = form.getCheckBox("GII-IC");
      const grado3 = form.getCheckBox("GII-TI");
      const grado4 = form.getCheckBox("GISA");
      const dni1 = form.getTextField("DNI1");
      const dni2 = form.getTextField("DNI2");
      const letra1 = form.getTextField("LETRA1");
      const letra2 = form.getTextField("LETRA2");
      const nombre1 = form.getTextField("NOMBRE1");
      const nombre2 = form.getTextField("NOMBRE2");
      const domicilio1 = form.getTextField("DOMICILIO1");
      const domicilio2 = form.getTextField("DOMICILIO2");
      const poblacion1 = form.getTextField("POBLACION1");
      const poblacion2 = form.getTextField("POBLACION2");
      const codigoPostal1 = form.getTextField("COD-POSTAL1");
      const codigoPostal2 = form.getTextField("COD-POSTAL2");
      const provincia1 = form.getTextField("PROVINCIA1");
      const provincia2 = form.getTextField("PROVINCIA2");
      const telefono1 = form.getTextField("TELEFONO1");
      const telefono2 = form.getTextField("TELEFONO2");
      const day = form.getTextField("DAY");
      const month = form.getTextField("MONTH");
      const year = form.getTextField("YEAR");

      //Asignaturas y códigos TODO: EL 1 DEBERÁ SER UN NÚMERO QUE CAMBIARÁ EN FUNCIÓN DEL ALUMNO QUE ESTÁ HACIENDO LA SOLICITUD
      asignaturas.forEach((asignatura, index) => {
        const asignaturaField = form.getTextField(`ASIGNATURA1-${index + 1}`);
        const codigoField = form.getTextField(`COD1-${index + 1}`);
        asignaturaField.setText(asignatura.asignatura);
        codigoField.setText(asignatura.codigo);
        asignaturaField.enableReadOnly();
        codigoField.enableReadOnly();
      });

      // SETTERS
      grado1.check();
      dni1.setText(dni);
      dni2.setText(dni);
      letra1.setText(letraDNI);
      letra2.setText(letraDNI);
      nombre1.setText(nombre);
      nombre2.setText(nombre);
      domicilio1.setText(domicilio);
      domicilio2.setText(domicilio);
      poblacion1.setText(poblacion);
      poblacion2.setText(poblacion);
      codigoPostal1.setText(codigoPostal);
      codigoPostal2.setText(codigoPostal);
      provincia1.setText(provincia);
      provincia2.setText(provincia);
      telefono1.setText(telefono);
      telefono2.setText(telefono);

      // Fecha para el pie de página
      day.setText(dayValue);
      month.setText(monthValue);
      year.setText(yearValue);

      // BLOQUEADORES
      grado1.enableReadOnly();
      grado2.enableReadOnly();
      grado3.enableReadOnly();
      grado4.enableReadOnly();
      dni1.enableReadOnly();
      dni2.enableReadOnly();
      letra1.enableReadOnly();
      letra2.enableReadOnly();
      nombre1.enableReadOnly();
      nombre2.enableReadOnly();
      domicilio1.enableReadOnly();
      domicilio2.enableReadOnly();
      poblacion1.enableReadOnly();
      poblacion2.enableReadOnly();
      codigoPostal1.enableReadOnly();
      codigoPostal2.enableReadOnly();
      provincia1.enableReadOnly();
      provincia2.enableReadOnly();
      telefono1.enableReadOnly();
      telefono2.enableReadOnly();
      day.enableReadOnly();
      month.enableReadOnly();
      year.enableReadOnly();

      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
    } catch (e) {
      console.error(e);
    }
  };

  const mostrarPDF = async () => {
    const pdfBytes = await generarPDF();
    const pdfUrl = URL.createObjectURL(
      new Blob([pdfBytes], { type: "application/pdf" })
    );
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
      <h1>Generación de PDF</h1>
      <div className="container">
        <div className="formulario">
          <div className="asociar">
            <label>
              DNI:{" "}
              <input
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
              />
            </label>
            <label>
              Letra DNI:{" "}
              <input
                type="text"
                value={letraDNI}
                onChange={(e) => setLetraDNI(e.target.value)}
              />
            </label>
          </div>
          <label>
            Domicilio:{" "}
            <input
              type="text"
              value={domicilio}
              onChange={(e) => setDomicilio(e.target.value)}
            />
          </label>
          <label>
            Población:{" "}
            <input
              type="text"
              value={poblacion}
              onChange={(e) => setPoblacion(e.target.value)}
            />
          </label>
          <div className="asociar">
            <label>
              Código Postal:{" "}
              <input
                type="text"
                value={codigoPostal}
                onChange={(e) => setCodigoPostal(e.target.value)}
              />
            </label>
            <label>
              Provincia:{" "}
              <input
                type="text"
                value={provincia}
                onChange={(e) => setProvincia(e.target.value)}
              />
            </label>
          </div>
          <label>
            Teléfono:{" "}
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
