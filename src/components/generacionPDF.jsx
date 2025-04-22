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
        console.log(data.result.result[0])
        setUsuarios(data.result.result[0].usuarios);
        setPermutas(data.result.result[0].permutas);
      } catch (error) {
        console.error("Error al obtener la lista de permutas:", error);
      }
    };
    obtenerListaPermutas();
  }, []);
  
  console.log(usuarios)
  console.log(permutas)

  const generarPDF = async () => {
    try {
      const pdfDoc = await PDFDocument.load(await obtenerPlantillaPermuta());
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

      // SETTERS
      switch (usuarios[0].estudio) {
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
        default:
          console.warn(`Grado "${usuarios[0].estudio}" no corresponde a ningún checkbox.`);
      }
      dni1.setText(dni);
      dni2.setText(dni);
      letra1.setText(letraDNI);
      letra2.setText(letraDNI);
      nombre1.setText(usuarios[0].nombre_completo);
      nombre2.setText(usuarios[1].nombre_completo);
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
