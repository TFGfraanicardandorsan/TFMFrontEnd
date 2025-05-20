import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/reportarIncidencia-style.css";
import { subidaArchivo } from "../services/subidaArchivos.js";
import { crearIncidencia } from "../services/incidencia.js"; 

export default function ReportarIncidencia() {
    const navigate = useNavigate();
    const [descripcion, setDescripcion] = useState("");
    const [tipoIncidencia, setTipoIncidencia] = useState("");
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState("");

    const tiposPermitidos = ['application/pdf', 'image/png'];

    const handleFileChange = (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            if (tiposPermitidos.includes(archivo.type)) {
                setFile(archivo);
                setFileError("");
            } else {
                setFile(null);
                setFileError("Solo se permiten archivos PDF o PNG");
                e.target.value = null; // Limpiar el input
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let fileId = null;
        if (file) {
            const formData = new FormData();
            formData.append("tipo","archivador")
            formData.append("file", file);
            try {
                const response = await subidaArchivo(formData);
                fileId = response?.result?.fileId;
            } catch (error) {
                console.error("Error subiendo el archivo:", error);
                alert("Hubo un problema al subir el archivo.");
                return;
            }
        }
        try {
            await crearIncidencia(descripcion, tipoIncidencia, fileId);
            alert("Incidencia enviada correctamente");
            navigate("/misIncidencias")
        } catch (error) {
            console.error("Error creando incidencia:", error);
            alert("Error al enviar la incidencia");
        }
    };

    return (
        <>
            <div className="report-issue-container">
                <div className="report-issue-container-form">
                    <h1>Abrir incidencia</h1>
                    <div>
                        <p>Si tienes algún problema con la plataforma, por favor, indícalo aquí trata de ser lo más descriptivo posible e indica los pasos que has seguido para encontrar el error. Si quieres cambiar algún tipo de dato del servicio indica el campo y en qué lugar quieres cambiarlo.</p>
                        <p>Recuerda que puedes adjuntar un archivo (máx. 10MB) para ayudar a resolver el problema.</p>
                    </div>
                    <form className="report-form" onSubmit={handleSubmit}>
                        <label htmlFor="tipoIncidencia">Tipo de Incidencia</label>
                        <select
                            id="tipoIncidencia"
                            value={tipoIncidencia}
                            onChange={(e) => setTipoIncidencia(e.target.value)}
                            required
                        >
                            <option value="">Selecciona el tipo de incidencia</option>
                            <option value="error">Error en la plataforma</option>
                            <option value="permuta">Problema con permutas</option>
                            <option value="otro">Otro</option>
                        </select>

                        <label htmlFor="descripcion">Detalles de la incidencia</label>
                        <textarea
                            id="descripcion"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Describe el problema..."
                            required
                        ></textarea>
                        <label htmlFor="file">
                            Archivo (Solo PDF o PNG)
                            <span className="file-info">📎 Máx: 10MB</span>
                        </label>
                        <input
                            type="file"
                            id="file"
                            accept=".pdf,.png"
                            onChange={handleFileChange}
                        />
                        {fileError && <p className="error-message">{fileError}</p>}
                        <button type="submit">Crear incidencia</button>
                    </form>
                </div>
            </div>
        </>
    );
}
