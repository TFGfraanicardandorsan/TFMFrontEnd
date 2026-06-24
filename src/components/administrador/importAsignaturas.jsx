import React, { useState } from "react";
import { importAsignaturas } from "../../services/estadisticas";
import "../../styles/admin-common.css";
import { useTranslation } from "react-i18next";

const ImportarAsignaturas = () => {
  const { t } = useTranslation();
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleArchivoChange = (e) => {
    setArchivo(e.target.files[0]);
    setMensaje("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) {
      setMensaje(t("admin.import_subjects.select_csv"));
      return;
    }
    setCargando(true);
    const formData = new FormData();
    formData.append("file", archivo);

    try {
      const data = await importAsignaturas(formData);
      if (data?.mensaje) {
        setMensaje(data.mensaje);
      } else if (data?.error) {
        setMensaje(data.error);
      } else {
        setMensaje(t("admin.import_subjects.success"));
      }
    } catch (error) {
      setMensaje(t("admin.import_subjects.network_error"));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="admin-embedded-form">
      <form onSubmit={handleSubmit} className="admin-embedded-form-inner">
        <input type="file" accept=".csv" onChange={handleArchivoChange} className="admin-input" />
        <button type="submit" disabled={cargando} className="admin-btn admin-btn-primary">
          {cargando ? t("admin.import_subjects.importing") : t("admin.import_subjects.import")}
        </button>
      </form>
      {mensaje && (
        <p className={`admin-form-message ${mensaje === t("admin.import_subjects.network_error") || mensaje === t("admin.import_subjects.select_csv") ? "error" : "success"}`}>
          {mensaje}
        </p>
      )}
    </div>
  );
};

export default ImportarAsignaturas;
