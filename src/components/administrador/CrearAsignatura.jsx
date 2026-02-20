import { useState, useEffect } from "react";
import { crearAsignatura } from "../../services/asignaturas.js";
import { obtenerEstudios } from "../../services/estudio.js";
import "../../styles/admin-common.css";

const CrearAsignatura = () => {
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
      setMensaje("El código debe ser un número");
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
      setMensaje("Asignatura creada correctamente");
      setForm({
        nombre: "",
        siglas: "",
        curso: "",
        codigo: "",
        estudios_id: ""
      });
    } catch (error) {
      setMensaje("Error al crear la asignatura",error);
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
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          required
          className="admin-input"
        />
        <input
          name="siglas"
          placeholder="Siglas"
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
          <option value="">Selecciona curso</option>
          <option value="PRIMERO">Primero</option>
          <option value="SEGUNDO">Segundo</option>
          <option value="TERCERO">Tercero</option>
          <option value="CUARTO">Cuarto</option>
        </select>
        <input
          name="codigo"
          placeholder="Código"
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
          <option value="">Selecciona estudio</option>
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
          Crear Asignatura
        </button>
      </div>
      {mensaje && (
        <p className={`admin-form-message ${mensaje.includes("Error") ? "error" : "success"}`}>
          {mensaje}
        </p>
      )}
    </form>
  );
};

export default CrearAsignatura;