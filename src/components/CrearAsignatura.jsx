import React, { useState } from "react";
import { postAPI } from "../lib/methodAPIs.js";

const CrearAsignatura = () => {
  const [form, setForm] = useState({
    nombre: "",
    siglas: "",
    curso: "",
    codigo: "",
    estudios_id: ""
  });
  const [mensaje, setMensaje] = useState("");

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
      await postAPI("/api/v1/asignatura/crearAsignatura", {
        nombre: form.nombre,
        siglas: form.siglas,
        curso: Number(form.curso),
        codigo: form.codigo,
        estudios_id: Number(form.estudios_id)
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
      setMensaje("Error al crear la asignatura");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="nombre"
        placeholder="Nombre"
        value={form.nombre}
        onChange={handleChange}
        required
      />
      <input
        name="siglas"
        placeholder="Siglas"
        value={form.siglas}
        onChange={handleChange}
        required
      />
      <select
        name="curso"
        value={form.curso}
        onChange={handleChange}
        required
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
      />
      <input
        name="estudios_id"
        placeholder="ID de estudios"
        type="number"
        value={form.estudios_id}
        onChange={handleChange}
        required
      />
      <button type="submit">Crear Asignatura</button>
      {mensaje && <p>{mensaje}</p>}
    </form>
  );
};

export default CrearAsignatura;