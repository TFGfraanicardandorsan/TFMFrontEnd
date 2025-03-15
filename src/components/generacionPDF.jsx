import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import plantillaPDF from "../assets/solicitud-permutas-2024-25.pdf";

export default function GeneracionPDF() {
    const [titulacion,setTitulacion] = useState("");
    const [dni,setDni] = useState("");
    const [letraDNI,setLetraDNI] = useState("");
    const [nombre,setNombre] = useState("");
    const [domicilio,setDomicilio] = useState("");
    const [poblacion,setPoblacion] = useState("");
    const [codigoPostal,setCodigoPostal] = useState("");
    const [provincia,setProvincia] = useState("");
    const [telefono,setTelefono] = useState("");
    const [codigo,setCodigo] = useState("");
    const [asignatura,setAsignatura] = useState("");
    const iframeRef = useRef(null);

    const generarPDF = async () => {
        try {
            const existingPdfBytes = await fetch(plantillaPDF).then((res) => res.arrayBuffer());
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const form = pdfDoc.getForm();

            form.getTextField('Titulación').setText(titulacion);
            form.getTextField('DNI').setText(dni);
            form.getTextField('Letra DNI').setText(letraDNI);
            form.getTextField('Nombre').setText(nombre);
            form.getTextField('Domicilio').setText(domicilio);
            form.getTextField('Población').setText(poblacion);
            form.getTextField('Código Postal').setText(codigoPostal);
            form.getTextField('Provincia').setText(provincia);
            form.getTextField('Teléfono').setText(telefono);
            form.getTextField('Código').setText(codigo);
            form.getTextField('Asignatura').setText(asignatura);

            const pdfBytes = await pdfDoc.save();
            return pdfBytes
        } catch (e) {
            console.error(e);
        }
    };

    const verificarFormulario = async () => {
        const existingPdfBytes = await fetch(plantillaPDF).then((res) => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const form = pdfDoc.getForm();
      
        if (!form) {
          console.log("El PDF no tiene un formulario interactivo.");
          return;
        }
      
        const fields = form.getFields();
        if (fields.length === 0) {
          console.log("El PDF tiene un formulario, pero no tiene campos interactivos.");
        } else {
          console.log("Campos encontrados en el formulario:");
          fields.forEach(field => console.log("Campo:", field.getName()));
        }
      };
      
      verificarFormulario();
      
      

    const mostrarPDF = async () => {
        const pdfBytes = await generarPDF();
        const pdfUrl = URL.createObjectURL(new Blob([pdfBytes], { type: "application/pdf" }));
        iframeRef.current.src = pdfUrl;
    };

    const descargarPDF = async () => {
        const pdfBytes = await generarPDF();
        const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
        saveAs(pdfBlob, "solicitud-permutas.pdf");
    }

    return (
        <div>
            <h1>Generación de PDF</h1>
            <label>Titulación: <input type="text" value={titulacion} onChange={(e) => setTitulacion(e.target.value)} /></label><br />
            <label>DNI: <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} /></label><br />
            <label>Letra DNI: <input type="text" value={letraDNI} onChange={(e) => setLetraDNI(e.target.value)} /></label><br />
            <label>Nombre: <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} /></label><br />
            <label>Domicilio: <input type="text" value={domicilio} onChange={(e) => setDomicilio(e.target.value)} /></label><br />
            <label>Población: <input type="text" value={poblacion} onChange={(e) => setPoblacion(e.target.value)} /></label><br />
            <label>Código Postal: <input type="text" value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} /></label><br />
            <label>Provincia: <input type="text" value={provincia} onChange={(e) => setProvincia(e.target.value)} /></label><br />
            <label>Teléfono: <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} /></label><br />
            <label>Código: <input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} /></label><br />
            <label>Asignatura: <input type="text" value={asignatura} onChange={(e) => setAsignatura(e.target.value)} /></label><br />
            <button onClick={mostrarPDF}>Mostrar PDF</button>
            <button onClick={descargarPDF}>Descargar PDF</button>
            <iframe ref={iframeRef} width="100%" height="500" title="PDF generado"></iframe>
        </div>
    );

}