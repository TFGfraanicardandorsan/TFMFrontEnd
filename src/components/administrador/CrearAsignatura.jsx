import { useState, useEffect } from "react";
import { crearAsignatura } from "../../services/asignaturas.js";
import { obtenerEstudios } from "../../services/estudio.js";
import "../../styles/admin-common.css";
import { useTranslation } from "react-i18next";

const CrearAsignatura = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    nombre: "",
    siglas: "",
    curso: "",
    codigo: "",
    estudios_id: ""
  });
  const [mensaje, setMensaje] = useState("");
  const [estudios, setEstudios] = useState([]);

  useEffect(() => {
    const fetchEstudios = async () => {
      const response = await obtenerEstudios();
      if (!response.err) {
        setEstudios(response.result?.result || []);
      } else {
        setEstudios([]);
      }
    };
    fetchEstudios();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isNaN(Number(form.codigo))) {
      setMensaje(t("admin.subjects.code_numeric"));
      return;
    }
    try {
      await crearAsignatura({
        nombre: form.nombre,
        siglas: form.siglas,
        curso: form.curso,
        codigo: parseInt(form.codigo),
        estudios_id: parseInt(form.estudios_id)
      });
      setMensaje(t("admin.subjects.success"));
      setForm({
        nombre: "",
        siglas: "",
        curso: "",
        codigo: "",
        estudios_id: ""
      });
    } catch (error) {
      setMensaje(t("admin.subjects.error"));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="admin-embedded-form"
    >
      <div className="admin-embedded-form-inner">
        <input
          name="nombre"
          placeholder={t("admin.subjects.name_placeholder")}
          value={form.nombre}
          onChange={handleChange}
          required
          className="admin-input"
        />
        <input
          name="siglas"
          placeholder={t("admin.subjects.acronym_placeholder")}
          value={form.siglas}
          onChange={handleChange}
          required
          className="admin-input"
        />
        <select
          name="curso"
          value={form.curso}
          onChange={handleChange}
          required
          className="admin-select"
        >
          <option value="">{t("common.select_course")}</option>
          <option value="PRIMERO">{t("common.courses.primero")}</option>
          <option value="SEGUNDO">{t("common.courses.segundo")}</option>
          <option value="TERCERO">{t("common.courses.tercero")}</option>
          <option value="CUARTO">{t("common.courses.cuarto")}</option>
        </select>
        <input
          name="codigo"
          placeholder={t("admin.subjects.code_placeholder")}
          type="number"
          value={form.codigo}
          onChange={handleChange}
          required
          className="admin-input"
        />
        <select
          name="estudios_id"
          value={form.estudios_id}
          onChange={handleChange}
          required
          className="admin-select"
        >
          <option value="">{t("common.select_study")}</option>
          {estudios.map((estudio) => (
            <option key={estudio.id} value={estudio.id}>
              {estudio.nombre}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
        >
          {t("admin.subjects.create")}
        </button>
      </div>
      {mensaje && (
        <p className={`admin-form-message ${mensaje === t("admin.subjects.error") || mensaje === t("admin.subjects.code_numeric") ? "error" : "success"}`}>
          {mensaje}
        </p>
      )}
    </form>
  );
};

export default CrearAsignatura;
