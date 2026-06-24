import { useState } from "react";
import { crearEstudio } from "../../services/estudio";
import "../../styles/CrearGradoAdmin.css"; 
import { useTranslation } from "react-i18next";

export default function CrearGradoAdmin() {
  const { t } = useTranslation();
  const [estudio, setEstudio] = useState("");
  const [siglas, setSiglas] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    if (!estudio.trim() || !siglas.trim()) {
      setError(t("admin.degrees.required"));
      return;
    }
    try {
      await crearEstudio(estudio, siglas);
      setMensaje(t("admin.degrees.success"));
      setEstudio("");
      setSiglas("");
    } catch (err) {
      setError(t("admin.degrees.error"));
    }
  };

  return (
    <div className="crear-grado-admin-container">
      <form onSubmit={handleSubmit} className="crear-grado-form">
        <div className="form-group">
          <label htmlFor="estudio">{t("admin.degrees.study_label")}</label>
          <input
            id="estudio"
            type="text"
            value={estudio}
            onChange={(e) => setEstudio(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="siglas">{t("admin.degrees.acronym_label")}</label>
          <input
            id="siglas"
            type="text"
            value={siglas}
            onChange={(e) => setSiglas(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="crear-btn">{t("admin.degrees.create")}</button>
      </form>
      {mensaje && <p className="success-message">{mensaje}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
