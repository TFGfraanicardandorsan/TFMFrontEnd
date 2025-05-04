import { useState, useEffect } from "react";
import { obtenerEstudios } from "../services/estudio";
import "../styles/seleccionarEstudio-style.css";
import { actualizarEstudiosUsuario } from "../services/usuario";

export default function SeleccionarEstudio () {    
    const [estudios, setEstudio] = useState([]); // Estado para almacenar los diferentes estudios
    const [selectedEstudio, setSelectedEstudio] = useState("");

  useEffect(() => {
    const obtenerEstudio = async () => {
    const response = await obtenerEstudios();
    if (!response.err) {
      setEstudio(response.result.result); 
    } else {
      console.error('Error al obtener los estudios:', response.errmsg);
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
                window.location.href = "/miPerfil";
            } else {
                alert(response.result.result)
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    };

    return (
        <>
            <div style={{ marginTop: "60px" }}>
                <p className="titulo">Selecciona tu grado o master:</p>
                <select value={selectedEstudio} onChange={handleSelectChange}>
                    <option value="" disabled>
                        Selecciona un estudio
                    </option>
                    {estudios.map((estudio, index) => (
                        <option key={index} value={estudio.nombre}>
                            {estudio.nombre}
                        </option>
                    ))}
                </select>
                <button onClick={handleSubmit} disabled={!selectedEstudio}>
                    Enviar
                </button>
            </div>
        </>
    );
};