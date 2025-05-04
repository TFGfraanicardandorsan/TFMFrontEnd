import { useState } from "react";
import { crearNotificacion } from "../services/notificacion";

export default function CrearNotificacion() {
    const [contenido, setContenido] = useState("");
    const [receptor, setReceptor] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!contenido || !receptor) {
            alert("Por favor, completa todos los campos.");
            return;
        }
        try {
            await crearNotificacion(receptor, contenido);
            alert("Notificación enviada correctamente.");
            setContenido("");
            setReceptor("");
        } catch (error) {
            console.error("Error al enviar la notificación:", error);
            alert("Hubo un error al enviar la notificación.");
        }
    };
    return (
        <>
        <br />
        <div className="notificacion-container">
            <div className="notificacion-form-wrapper">
                <h1>Notificar</h1>
                <form className="notificacion-form" onSubmit={handleSubmit}>
                    <label htmlFor="contenido">Contenido</label>
                    <textarea
                        id="contenido"
                        value={contenido}
                        onChange={(e) => setContenido(e.target.value)}
                        placeholder="Escribe el contenido de la notificación..."
                        required
                    ></textarea>
                    <label htmlFor="receptor">Receptor</label>
                    <select
                        id="receptor"
                        value={receptor}
                        onChange={(e) => setReceptor(e.target.value)}
                        required
                    >
                        <option value="">Selecciona el receptor</option>
                        <option value="all">Todos</option>
                        <option value="estudiante">Estudiante</option>
                        <option value="administrador">Administrador</option>
                    </select>
                    <button type="submit">Enviar notificación</button>
                </form>
            </div>
        </div>
        </>
    );
}
