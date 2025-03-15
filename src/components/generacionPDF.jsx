import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import plantillaPDF from "../assets/solicitud-permutas-2024-25v1.1.pdf";
import Navbar from "./navbar";
import "../styles/generacionPDF-style.css";

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

            // form.getTextField('Titulación').setText(titulacion);
            const dni1 = form.getTextField('DNI1');
            // form.getTextField('DNI1').setText(dni).enableReadOnly();
            form.getTextField('LETRA1').setText(letraDNI);
            form.getTextField('NOMBRE1').setText(nombre);
            form.getTextField('DOMICILIO1').setText(domicilio);
            form.getTextField('POBLACION1').setText(poblacion);
            form.getTextField('COD-POSTAL1').setText(codigoPostal);
            form.getTextField('PROVINCIA1').setText(provincia);
            form.getTextField('TELEFONO1').setText(telefono);

            // SETTERS
            dni1.setText(dni);

            // BLOQUEADORES
            dni1.enableReadOnly();
            // form.getTextField('Código').setText(codigo);
            // form.getTextField('Asignatura').setText(asignatura);

            const pdfBytes = await pdfDoc.save();
            return pdfBytes
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
    }

    return (
        <>
            <Navbar />
            <br/>
            
            <h1>Generación de PDF</h1>
            <div className="container">
                {/* 📝 Formulario a la izquierda */}
                <div className="formulario">
                    
                    <label>Titulación: <input type="text" value={titulacion} onChange={(e) => setTitulacion(e.target.value)} /></label>
                    <label>DNI: <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} /></label>
                    <label>Letra DNI: <input type="text" value={letraDNI} onChange={(e) => setLetraDNI(e.target.value)} /></label>
                    <label>Nombre: <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} /></label>
                    <label>Domicilio: <input type="text" value={domicilio} onChange={(e) => setDomicilio(e.target.value)} /></label>
                    <label>Población: <input type="text" value={poblacion} onChange={(e) => setPoblacion(e.target.value)} /></label>
                    <label>Código Postal: <input type="text" value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} /></label>
                    <label>Provincia: <input type="text" value={provincia} onChange={(e) => setProvincia(e.target.value)} /></label>
                    <label>Teléfono: <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} /></label>
                    <label>Código: <input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} /></label>
                    <label>Asignatura: <input type="text" value={asignatura} onChange={(e) => setAsignatura(e.target.value)} /></label>
                    <button onClick={mostrarPDF}>Mostrar PDF</button>
                    <button onClick={descargarPDF}>Descargar PDF</button>
                </div>

                {/* 📄 Iframe a la derecha */}
                <div className="pdf-container">
                    <iframe ref={iframeRef} title="PDF generado"></iframe>
                </div>
            </div>
        </>
    );

}