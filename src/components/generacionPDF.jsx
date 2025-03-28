import { useState, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import plantillaPDF from "../assets/solicitud-permutas-2024-25V2.pdf";
import Navbar from "./navbar";
import "../styles/generacionPDF-style.css";
import Footer from "./footer";
import { obtenerAsignaturasUsuario } from "../services/asignaturas.js";
import { obtenerDatosUsuario } from "../services/usuario"; 

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
  const [codigo, setCodigo] = useState("");
  const [asignatura, setAsignatura] = useState("");
  const iframeRef = useRef(null);

  useEffect(() => {
    const obtenerAsignaturaUsuario = async () => {
      try {
        const data = await obtenerAsignaturasUsuario();
        setCodigo(data.result.result.codigo);
        setAsignatura(data.result.result.asignatura);
      } catch (error) {
        console.error("Error al obtener las incidencias:", error);
      }
    };
    obtenerAsignaturaUsuario();
  }, []);

  // para obtener el campo nombre y grado del usuario para el formulario
  useEffect(() => {
    const obtenerDatosUsuario = async () => {
      try {
        const data = await obtenerDatosUsuario();
        setGrado(data.result.result.titulacion);
        setNombre(data.result.result.nombre_completo);
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
      }
    };
    obtenerDatosUsuario();
  }, []);

  console.log('asignaturas:',asignatura)
  console.log('codigo:',codigo)
  console.log('grado:',grado)
  console.log('nombre:',nombre)

  
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

      //Asignaturas y códigos
      // const codigo1_1 = form.getTextField('COD1-1');
      // const asignatura1_1 = form.getTextField('ASIGNATURA1-1');
      // const codigo1_2 = form.getTextField('COD1-2');
      // const asignatura1_2 = form.getTextField('ASIGNATURA1-2');
      // const codigo1_3 = form.getTextField('COD1-3');
      // const asignatura1_3 = form.getTextField('ASIGNATURA1-3');
      // const codigo1_4 = form.getTextField('COD1-4');
      // const asignatura1_4 = form.getTextField('ASIGNATURA1-4');
      // const codigo1_5 = form.getTextField('COD1-5');
      // const asignatura1_5 = form.getTextField('ASIGNATURA1-5');
      // const codigo1_6 = form.getTextField('COD1-6');
      // const asignatura1_6 = form.getTextField('ASIGNATURA1-6');
      // const codigo1_7 = form.getTextField('COD1-7');
      // const asignatura1_7 = form.getTextField('ASIGNATURA1-7');
      // const codigo1_8 = form.getTextField('COD1-8');
      // const asignatura1_8 = form.getTextField('ASIGNATURA1-8');
      // const codigo1_9 = form.getTextField('COD1-9');
      // const asignatura1_9 = form.getTextField('ASIGNATURA1-9');
      // const codigo1_10 = form.getTextField('COD1-10');
      // const asignatura1_10 = form.getTextField('ASIGNATURA1-10');
      // const codigo1_11 = form.getTextField('COD1-11');
      // const asignatura1_11 = form.getTextField('ASIGNATURA1-11');
      // const codigo1_12 = form.getTextField('COD1-12');
      // const asignatura1_12 = form.getTextField('ASIGNATURA1-12');
      // const codigo1_13 = form.getTextField('COD1-13');
      // const asignatura1_13 = form.getTextField('ASIGNATURA1-13');
      // const codigo1_14 = form.getTextField('COD1-14');
      // const asignatura1_14 = form.getTextField('ASIGNATURA1-14');
      // const codigo1_15 = form.getTextField('COD1-15');
      // const asignatura1_15 = form.getTextField('ASIGNATURA1-15');
      // const codigo1_16 = form.getTextField('COD1-16');
      // const asignatura1_16 = form.getTextField('ASIGNATURA1-16');
      // const codigo2_1 = form.getTextField('COD2-1');
      // const asignatura2_1 = form.getTextField('ASIGNATURA2-1');
      // const codigo2_2 = form.getTextField('COD2-2');
      // const asignatura2_2 = form.getTextField('ASIGNATURA2-2');
      // const codigo2_3 = form.getTextField('COD2-3');
      // const asignatura2_3 = form.getTextField('ASIGNATURA2-3');
      // const codigo2_4 = form.getTextField('COD2-4');
      // const asignatura2_4 = form.getTextField('ASIGNATURA2-4');
      // const codigo2_5 = form.getTextField('COD2-5');
      // const asignatura2_5 = form.getTextField('ASIGNATURA2-5');
      // const codigo2_6 = form.getTextField('COD2-6');
      // const asignatura2_6 = form.getTextField('ASIGNATURA2-6');
      // const codigo2_7 = form.getTextField('COD2-7');
      // const asignatura2_7 = form.getTextField('ASIGNATURA2-7');
      // const codigo2_8 = form.getTextField('COD2-8');
      // const asignatura2_8 = form.getTextField('ASIGNATURA2-8');
      // const codigo2_9 = form.getTextField('COD2-9');
      // const asignatura2_9 = form.getTextField('ASIGNATURA2-9');
      // const codigo2_10 = form.getTextField('COD2-10');
      // const asignatura2_10 = form.getTextField('ASIGNATURA2-10');
      // const codigo2_11 = form.getTextField('COD2-11');
      // const asignatura2_11 = form.getTextField('ASIGNATURA2-11');
      // const codigo2_12 = form.getTextField('COD2-12');
      // const asignatura2_12 = form.getTextField('ASIGNATURA2-12');
      // const codigo2_13 = form.getTextField('COD2-13');
      // const asignatura2_13 = form.getTextField('ASIGNATURA2-13');
      // const codigo2_14 = form.getTextField('COD2-14');
      // const asignatura2_14 = form.getTextField('ASIGNATURA2-14');
      // const codigo2_15 = form.getTextField('COD2-15');
      // const asignatura2_15 = form.getTextField('ASIGNATURA2-15');
      // const codigo2_16 = form.getTextField('COD2-16');
      // const asignatura2_16 = form.getTextField('ASIGNATURA2-16');

      // //Asignaturas y códigos
      // codigo1_1.setText(codigo);
      // asignatura1_1.setText(asignatura);
      // codigo1_2.setText(codigo);
      // asignatura1_2.setText(asignatura);
      // codigo1_3.setText(codigo);
      // asignatura1_3.setText(asignatura);
      // codigo1_4.setText(codigo);
      // asignatura1_4.setText(asignatura);
      // codigo1_5.setText(codigo);
      // asignatura1_5.setText(asignatura);
      // codigo1_6.setText(codigo);
      // asignatura1_6.setText(asignatura);
      // codigo1_7.setText(codigo);
      // asignatura1_7.setText(asignatura);
      // codigo1_8.setText(codigo);
      // asignatura1_8.setText(asignatura);
      // codigo1_9.setText(codigo);
      // asignatura1_9.setText(asignatura);
      // codigo1_10.setText(codigo);
      // asignatura1_10.setText(asignatura);
      // codigo1_11.setText(codigo);
      // asignatura1_11.setText(asignatura);
      // codigo1_12.setText(codigo);
      // asignatura1_12.setText(asignatura);
      // codigo1_13.setText(codigo);
      // asignatura1_13.setText(asignatura);
      // codigo1_14.setText(codigo);
      // asignatura1_14.setText(asignatura);
      // codigo1_15.setText(codigo);
      // asignatura1_15.setText(asignatura);
      // codigo1_16.setText(codigo);
      // asignatura1_16.setText(asignatura);
      // codigo2_1.setText(codigo);
      // asignatura2_1.setText(asignatura);
      // codigo2_2.setText(codigo);
      // asignatura2_2.setText(asignatura);
      // codigo2_3.setText(codigo);
      // asignatura2_3.setText(asignatura);
      // codigo2_4.setText(codigo);
      // asignatura2_4.setText(asignatura);
      // codigo2_5.setText(codigo);
      // asignatura2_5.setText(asignatura);
      // codigo2_6.setText(codigo);
      // asignatura2_6.setText(asignatura);
      // codigo2_7.setText(codigo);
      // asignatura2_7.setText(asignatura);
      // codigo2_8.setText(codigo);
      // asignatura2_8.setText(asignatura);
      // codigo2_9.setText(codigo);
      // asignatura2_9.setText(asignatura);
      // codigo2_10.setText(codigo);
      // asignatura2_10.setText(asignatura);
      // codigo2_11.setText(codigo);
      // asignatura2_11.setText(asignatura);
      // codigo2_12.setText(codigo);
      // asignatura2_12.setText(asignatura);
      // codigo2_13.setText(codigo);
      // asignatura2_13.setText(asignatura);
      // codigo2_14.setText(codigo);
      // asignatura2_14.setText(asignatura);
      // codigo2_15.setText(codigo);
      // asignatura2_15.setText(asignatura);
      // codigo2_16.setText(codigo);
      // asignatura2_16.setText(asignatura);

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
      const today = new Date();
      const dayValue = String(today.getDate()).padStart(2, "0");
      const yearValue = today.getFullYear().toString();
      const monthNames = [
        "ENERO",
        "FEBRERO",
        "MARZO",
        "ABRIL",
        "MAYO",
        "JUNIO",
        "JULIO",
        "AGOSTO",
        "SEPTIEMBRE",
        "OCTUBRE",
        "NOVIEMBRE",
        "DICIEMBRE",
      ];
      const monthValue = monthNames[today.getMonth()];

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

      // asignatura1_1.enableReadOnly();
      // asignatura1_2.enableReadOnly();
      // asignatura1_3.enableReadOnly();
      // asignatura1_4.enableReadOnly();
      // asignatura1_5.enableReadOnly();
      // asignatura1_6.enableReadOnly();
      // asignatura1_7.enableReadOnly();
      // asignatura1_8.enableReadOnly();
      // asignatura1_9.enableReadOnly();
      // asignatura1_10.enableReadOnly();
      // asignatura1_11.enableReadOnly();
      // asignatura1_12.enableReadOnly();
      // asignatura1_13.enableReadOnly();
      // asignatura1_14.enableReadOnly();
      // asignatura1_15.enableReadOnly();
      // asignatura1_16.enableReadOnly();
      // asignatura2_1.enableReadOnly();
      // asignatura2_2.enableReadOnly();
      // asignatura2_3.enableReadOnly();
      // asignatura2_4.enableReadOnly();
      // asignatura2_5.enableReadOnly();
      // asignatura2_6.enableReadOnly();
      // asignatura2_7.enableReadOnly();
      // asignatura2_8.enableReadOnly();
      // asignatura2_9.enableReadOnly();
      // asignatura2_10.enableReadOnly();
      // asignatura2_11.enableReadOnly();
      // asignatura2_12.enableReadOnly();
      // asignatura2_13.enableReadOnly();
      // asignatura2_14.enableReadOnly();
      // asignatura2_15.enableReadOnly();
      // asignatura2_16.enableReadOnly();

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
        {/* 📝 Formulario a la izquierda */}
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

        {/* 📄 Iframe a la derecha */}
        <div className="pdf-container">
          <iframe ref={iframeRef} title="PDF generado"></iframe>
        </div>
      </div>
      <Footer />
    </>
  );
}
