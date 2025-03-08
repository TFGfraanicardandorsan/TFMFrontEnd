import { useState, useEffect } from "react";
import Footer from "./footer";
import Navbar from "./navbar";
import { obtenerEstudios } from "../services/estudio"; // Importamos tu servicio
import "../styles/seleccionarEstudio-style.css";
import { actualizarEstudiosUsuario } from "../services/usuario";
import { Navigate } from "react-router-dom";

const SeleccionarEstudio = () => {    
    const [estudios, setEstudio] = useState([]); // Estado para almacenar los diferentes estudios
    const [selectedEstudio, setSelectedEstudio] = useState("");

  useEffect(() => {
    const obtenerEstudio = async () => {
      // Llamamos al servicio para obtener los diferentes estudios
    const response = await obtenerEstudios();
    if (!response.err) {
      setEstudio(response.result.result); // Guardamos los datos de los estudios en el estado
    } else {
      console.error('Error al obtener los estudios:', response.errmsg);
    }
    };
    obtenerEstudio();
  }, []);  // Solo se ejecuta una vez cuando el componente se monta


    const handleSelectChange = (event) => {
        setSelectedEstudio(event.target.value);
    };

    const handleSubmit = async () => {
        try {
            const response = await actualizarEstudiosUsuario(selectedEstudio);
            if (!response.err) {
                console.log("Estudio actualizado correctamente");
                return <Navigate to="/miPerfil" />;
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