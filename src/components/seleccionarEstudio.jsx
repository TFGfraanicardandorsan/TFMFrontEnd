import { useState, useEffect } from "react";
import { obtenerEstudios } from "../services/estudio";
import "../styles/seleccionarEstudio-style.css";
import { actualizarEstudiosUsuario } from "../services/usuario";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { logError } from "../lib/logger";

export default function SeleccionarEstudio () {    
    const [estudios, setEstudio] = useState([]);
    const [selectedEstudio, setSelectedEstudio] = useState("");
    const navigate = useNavigate();

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


    const handleSelectChange = (event) => {
        setSelectedEstudio(event.target.value);
    };

    const handleSubmit = async () => {
        try {
            const response = await actualizarEstudiosUsuario(selectedEstudio);
            if (response.result.result === 'Estudios seleccionados') {
                toast.success("Estudio seleccionado correctamente");
                navigate("/miPerfil");
            } else {
                toast.warning(response.result.result);
            }
        } catch (error) {
            toast.error("Error en la solicitud.");
            logError(error);
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
                <p className="subtitulo">Recuerda que solo puedes seleccionar un estudio.</p>
                <p className="subtitulo">Una vez seleccionado, podrás elegir las asignaturas y grupos.</p>
                <p className="subtitulo">Si te equivocas a la hora de seleccionar el estudio, reporta una incidencia.</p>
                <p className="subtitulo">Si no seleccionas nada, no podrás hacer uso del servicio.</p>
                <button onClick={handleSubmit} disabled={!selectedEstudio}>
                    Enviar
                </button>
            </div>
        </>
    );
};