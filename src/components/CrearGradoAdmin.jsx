import { useState } from "react";
import { crearEstudio } from "../services/estudio";
import "../styles/CrearGradoAdmin.css"; 

export default function CrearGradoAdmin() {
  const [nombre, setNombre] = useState("");
  const [siglas, setSiglas] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    if (!nombre.trim() || !siglas.trim()) {
      setError("Por favor, rellena ambos campos.");
      return;
    }
    try {
      await crearEstudio(nombre, siglas);
      setMensaje("Grado creado correctamente.");
      setNombre("");
      setSiglas("");
    } catch (err) {
      setError("Error al crear el grado.", err);
    }
  };

  return (
    <div className="crear-grado-admin-container">
      <h2>Crear nuevo grado</h2>
      <form onSubmit={handleSubmit} className="crear-grado-form">
        <div>
          <label htmlFor="nombre">Nombre del grado:</label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="siglas">Siglas:</label>
          <input
            id="siglas"
            type="text"
            value={siglas}
            onChange={(e) => setSiglas(e.target.value)}
            required
          />
        </div>
        <button type="submit">Crear grado</button>
      </form>
      {mensaje && <p className="success-message">{mensaje}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}