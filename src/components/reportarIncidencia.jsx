import { useState } from "react";
import "../styles/reportarIncidencia-style.css";
import Footer from "./footer";
import Navbar from "./navbar";
import { subidaArchivo } from "../services/subidaArchivos.js";
import { crearIncidencia } from "../services/incidencia.js"; 

export default function ReportarIncidencia() {
    const [descripcion, setDescripcion] = useState("");
    const [tipoIncidencia, setTipoIncidencia] = useState("");
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        let fileId = null;
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            try {
                const response = await subidaArchivo(formData);
                console.log("response", response);
                fileId = response?.result?.fileId;
            } catch (error) {
                console.error("Error subiendo el archivo:", error);
                alert("Hubo un problema al subir el archivo.");
                return;
            }
        }
        console.log("fileId", fileId);
        try {
            await crearIncidencia(descripcion, tipoIncidencia, fileId);
            alert("Incidencia enviada correctamente");
        } catch (error) {
            console.error("Error creando incidencia:", error);
            alert("Error al enviar la incidencia");
        }
    };

    return (
        <>
            <div className="report-issue-container">
                <Navbar />
                <div className="report-issue-container-form">
                    <h1>Abrir incidencia</h1>
                    <form className="report-form" onSubmit={handleSubmit}>
                        <label htmlFor="descripcion">Tipo de Incidencia</label>
                        <select
                            id="descripcion"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            required
                        >
                            <option value="">Selecciona el tipo de incidencia</option>
                            <option value="error">Error en la plataforma</option>
                            <option value="permuta">Problema con permutas</option>
                            <option value="otro">Otro</option>
                        </select>

                        <label htmlFor="tipoIncidencia">Detalles de la incidencia</label>
                        <textarea
                            id="tipoIncidencia"
                            value={tipoIncidencia}
                            onChange={(e) => setTipoIncidencia(e.target.value)}
                            placeholder="Describe el problema..."
                            required
                        ></textarea>

                        <label htmlFor="file">Archivo</label>
                        <input
                            type="file"
                            id="file"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        <button type="submit">Crear incidencia</button>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
}
