import { useState } from "react";
import "../styles/reportarIncidencia-style.css";
import Footer from "./footer";
import Navbar from "./navbar";
import { subidaArchivo } from "../services/subidaArchivos"; // Importamos tu servicio

export default function reportarIncidencia() {
    const [issueType, setIssueType] = useState("");
    const [details, setDetails] = useState("");
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("issueType", issueType);
        formData.append("details", details);
        formData.append("file", file);
        await subidaArchivo(formData);
        alert("Incidencia enviada correctamente");
    };        

    return (
        <>
        
        <div className="report-issue-container">
        <Navbar />
        <div className="report-issue-container-form">
            <h1>Abrir incidencia</h1>
            <form className="report-form" onSubmit={handleSubmit}>
                {/* Tipo de Incidencia */}
                <label htmlFor="issueType">Tipo de Incidencia</label>
                <select
                    id="issueType"
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    required
                >
                    <option value="">Selecciona el tipo de incidencia</option>
                    <option value="error">Error en la plataforma</option>
                    <option value="permuta">Problema con permutas</option>
                    <option value="otro">Otro</option>
                </select>

                {/* Detalles */}
                <label htmlFor="details">Detalles de la incidencia</label>
                <textarea
                    id="details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Describe el problema..."
                    required
                ></textarea>

                {/* Archivo */}
                <label htmlFor="file">Archivo</label>
                <input
                    type="file"
                    id="file"
                    onChange={(e) => setFile(e.target.files[0])}
                />

                {/* Botón de envío */}
                <button type="submit">Crear incidencia</button>
            </form>
        </div>
        </div>
        <Footer/>
        </>
    );
}
