import React, { useState } from "react";
import { importAsignaturas } from "../../services/estadisticas";
import "../../styles/admin-common.css";

const ImportarAsignaturas = () => {
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
      setMensaje("Selecciona un archivo CSV.");
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
        setMensaje("Importación completada correctamente.");
      }
    } catch (error) {
      setMensaje("Error de red al importar.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="admin-embedded-form">
      <form onSubmit={handleSubmit} className="admin-embedded-form-inner">
        <input type="file" accept=".csv" onChange={handleArchivoChange} className="admin-input" />
        <button type="submit" disabled={cargando} className="admin-btn admin-btn-primary">
          {cargando ? "Importando..." : "Importar"}
        </button>
      </form>
      {mensaje && (
        <p className={`admin-form-message ${mensaje.includes("Error") ? "error" : "success"}`}>
          {mensaje}
        </p>
      )}
    </div>
  );
};

export default ImportarAsignaturas;