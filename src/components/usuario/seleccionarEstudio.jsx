import { useState, useEffect } from "react";
import { obtenerEstudios } from "../../services/estudio";
import "../../styles/seleccionarEstudio-style.css";
import { actualizarEstudiosUsuario } from "../../services/usuario";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { logError } from "../../lib/logger";
import { useTranslation } from "react-i18next";

export default function SeleccionarEstudio() {
    const { t } = useTranslation();
    const [estudios, setEstudio] = useState([]);
    const [selectedEstudio, setSelectedEstudio] = useState("");
    const navigate = useNavigate();
    const reminders = t("user.study_selection.reminders", { returnObjects: true });

    useEffect(() => {
        const obtenerEstudio = async () => {
            const response = await obtenerEstudios();
            if (!response.err) {
                setEstudio(response.result.result);
            } else {
                logError(response.errmsg);
            }
        };
        obtenerEstudio();
    }, []);


    const handleSelectChange = (event) => {
        setSelectedEstudio(event.target.value);
    };

    const handleSubmit = async () => {
        try {
            const response = await actualizarEstudiosUsuario(selectedEstudio);
            if (response.result.result === 'Estudios seleccionados') {
                toast.success(t("user.study_selection.success"));
                navigate("/miPerfil");
            }
        } catch (error) {
            toast.error(t("user.study_selection.request_error"));
            logError(error);
        }
    };

    return (
        <div className="container" style={{ marginTop: "60px" }}>
            <div className="header">
                <h1 className="titulo">{t("user.study_selection.title")}</h1>
            </div>
            <div className="form-group">
                <select value={selectedEstudio} onChange={handleSelectChange}>
                    <option value="" disabled>
                        {t("user.study_selection.placeholder")}
                    </option>
                    {estudios.map((estudio, index) => (
                        <option key={index} value={estudio.nombre}>
                            {estudio.nombre}
                        </option>
                    ))}
                </select>
            </div>
            {reminders.map((reminder) => (
                <p className="subtitulo" key={reminder}>{reminder}</p>
            ))}
            <div className="button-group">
                <button onClick={handleSubmit} disabled={!selectedEstudio}>
                    {t("common.submit")}
                </button>
            </div>
        </div>
    );
};
