import React, { useState, useEffect } from "react";
import Footer from "./footer";
import Navbar from "./navbar";
import { obtenerEstudios } from "../services/estudio"; // Importamos tu servicio
import "../styles/seleccionarEstudio-style.css";
import { actualizarEstudiosUsuario } from "../services/usuario";

const SeleccionarEstudio = () => {
    //const [estudios, setEstudios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [estudios, setEstudios] = useState([]); // Estado para almacenar los datos del usuario

  useEffect(() => {
    const obtenerEstudio = async () => {
      // Llamamos al servicio para obtener los datos del usuario
    const response = await obtenerEstudios();
    if (!response.err) {
      setEstudios(response.result.result); // Guardamos los datos del usuario en el estado
    } else {
      console.error('Error al obtener los estudios:', response.errmsg);
    }
      if (!response.err) {
        setUsuario(response.result.result); // Guardamos los datos del usuario en el estado
      } else {
        console.error('Error al obtener los estudios:', response.errmsg);
      }
    };

    obtenerEstudio();
  }, []);  // Solo se ejecuta una vez cuando el componente se monta


    const [selectedEstudio, setSelectedEstudio] = useState("");

    const handleSelectChange = (event) => {
        setSelectedEstudio(event.target.value);
    };

    const handleSubmit = async () => {
        const data = {
            estudio: selectedEstudio
        };
        console.log("JSON to POST:", JSON.stringify(data));
        try {
            const response = await actualizarEstudiosUsuario(data);
            if (!response.err) {
                console.log("Estudio actualizado correctamente");
            } else {
                console.error("Error al actualizar el estudio:", response.errmsg);
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    };


    return (
        <>
            <Navbar />
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
            <Footer />
        </>
    );
};

export default SeleccionarEstudio;