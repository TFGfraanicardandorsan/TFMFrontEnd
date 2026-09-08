import { useState, useEffect } from "react";
import { obtenerEstudios } from "../../services/estudio";
import "../../styles/seleccionarEstudio-style.css";
import { actualizarEstudiosUsuario } from "../../services/usuario";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { logError } from "../../lib/logger";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

export default function SeleccionarEstudio({ estudioActual = "", onEstudioActualizado, onCancel }) {
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

    useEffect(() => {
        setSelectedEstudio(estudioActual || "");
    }, [estudioActual]);


    const handleSelectChange = (event) => {
        setSelectedEstudio(event.target.value);
    };

    const handleSubmit = async () => {
        try {
            const response = await actualizarEstudiosUsuario(selectedEstudio);
            if (response.err || response.result?.err) {
                throw new Error(
                    response.errmsg
                    || response.result?.message
                    || t("user.study_selection.request_error")
                );
            }
            toast.success(estudioActual
                ? t("user.study_selection.update_success")
                : t("user.study_selection.success"));
            onEstudioActualizado?.(selectedEstudio);
            if (!onEstudioActualizado) navigate("/miPerfil");
        } catch (error) {
            toast.error(error.message || t("user.study_selection.request_error"));
            logError(error);
        }
    };

    return (
        <div className="container" style={{ marginTop: "60px" }}>
            <div className="header">
                <h1 className="titulo">
                    {estudioActual
                        ? t("user.study_selection.update_title")
                        : t("user.study_selection.title")}
                </h1>
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
                {onCancel && (
                    <button type="button" onClick={onCancel}>
                        {t("common.cancel")}
                    </button>
                )}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!selectedEstudio || selectedEstudio === estudioActual}
                >
                    {estudioActual
                        ? t("user.study_selection.update_action")
                        : t("common.submit")}
                </button>
            </div>
        </div>
    );
};

SeleccionarEstudio.propTypes = {
    estudioActual: PropTypes.string,
    onEstudioActualizado: PropTypes.func,
    onCancel: PropTypes.func,
};
