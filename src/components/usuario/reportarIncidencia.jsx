import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/user-common.css";
// import "../../styles/reportarIncidencia-style.css"; // Podríamos mantenerlo para reglas muy específicas, pero intentar usar user-common
import { subidaArchivo } from "../../services/subidaArchivos.js";
import { crearIncidencia } from "../../services/incidencia.js";
import { toast } from "react-toastify";
import { logError } from "../../lib/logger.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faPaperclip, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

export default function ReportarIncidencia() {
    const { t } = useTranslation();
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
                setFileError(t("incidents.file_error_type"));
                e.target.value = null;
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let fileId = null;
        if (file) {
            const formData = new FormData();
            formData.append("tipo", "archivador")
            formData.append("file", file);
            try {
                const response = await subidaArchivo(formData);
                fileId = response?.result?.fileId;
            } catch (error) {
                toast.error(t("incidents.file_upload_error"));
                logError(error);
                return;
            }
        }
        try {
            await crearIncidencia(descripcion, tipoIncidencia, fileId);
            toast.success(t("incidents.incident_success"));
            navigate("/misIncidencias")
        } catch (error) {
            toast.error(t("incidents.incident_error"));
            logError(error);
        }
    };

    return (
        <div className="page-container">
            <div className="content-wrap">
                <div className="page-header">
                    <h1 className="page-title">{t("incidents.report_title")}</h1>
                    <p className="page-subtitle">
                        {t("incidents.report_subtitle")}
                    </p>
                </div>

                <div className="user-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <p style={{ marginBottom: '10px', color: 'var(--user-primary)', fontWeight: 'bold' }}>
                            <FontAwesomeIcon icon={faExclamationTriangle} /> {t("incidents.instructions")}
                        </p>
                        <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-secondary)' }}>
                            <li>{t("incidents.instruction_1")}</li>
                            <li>{t("incidents.instruction_2")}</li>
                            <li>{t("incidents.instruction_3")}</li>
                        </ul>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="tipoIncidencia" className="form-label">{t("incidents.incident_type")}</label>
                            <select
                                id="tipoIncidencia"
                                value={tipoIncidencia}
                                onChange={(e) => setTipoIncidencia(e.target.value)}
                                required
                                className="form-select"
                            >
                                <option value="">{t("incidents.select_type")}</option>
                                <option value="error">{t("incidents.type_error")}</option>
                                <option value="permuta">{t("incidents.type_exchange")}</option>
                                <option value="otro">{t("incidents.type_other")}</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="descripcion" className="form-label">{t("incidents.incident_details")}</label>
                            <textarea
                                id="descripcion"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder={t("incidents.details_placeholder")}
                                required
                                className="form-textarea"
                                rows="6"
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label htmlFor="file" className="form-label">
                                {t("incidents.attach_file_optional")}
                            </label>
                            <div className="file-upload-wrapper">
                                <input
                                    type="file"
                                    id="file"
                                    accept=".pdf,.png"
                                    onChange={handleFileChange}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 1 }}
                                />
                                <div className="file-upload-content" style={{ pointerEvents: 'none' }}>
                                    <FontAwesomeIcon icon={faPaperclip} className="file-upload-icon" />
                                    <p className="file-upload-text">
                                        {file ? file.name : t("incidents.click_to_attach")}
                                    </p>
                                    <p className="file-upload-hint">{t("incidents.file_hint")}</p>
                                </div>
                            </div>
                            {fileError && <p className="user-error" style={{ textAlign: 'left', padding: '5px 0', fontSize: '0.9rem' }}>{fileError}</p>}
                        </div>

                        <div style={{ marginTop: '30px' }}>
                            <button type="submit" className="btn btn-primary btn-full">
                                <FontAwesomeIcon icon={faPaperPlane} /> {t("incidents.send_incident")}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
            <div style={{ height: "80px" }} />
        </div>
    );
}
