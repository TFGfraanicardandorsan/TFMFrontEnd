import { useState, useEffect } from "react";
import Footer from "./footer";
import Navbar from "./navbar";
import { obtenerTodosGruposMisAsignaturasUsuario } from "../services/grupo.js";
import "../styles/seleccionarEstudio-style.css";

export default function SeleccionarGrupos() {
  const [asignaturas, setAsignaturas] = useState([]);
  const [grupos, setGrupos] = useState([]); 
  const [selectedAsignaturas, setSelectedAsignaturas] = useState([]);
  const [selectedGrupo, setGrupo] = useState(""); 

    useEffect(() => {
      const ObtenerTodosGruposMisAsignaturasUsuario = async () => {
        try {
          const response = await obtenerTodosGruposMisAsignaturasUsuario();
          setAsignaturas(response.result.result);
        } catch (error) {
          console.error("Error al obtener las asignaturas del usuario:", error);
        }
      };
      ObtenerTodosGruposMisAsignaturasUsuario();
    }, []);

  const handleSelectChangeAsignatura = (event) => {
    setSelectedAsignaturas(event.target.selectedOptions, (option) => option.value);
  };

//   const handleSubmit = async () => {
//     try {
//       const response = await actualizarEstudiosUsuario(selectedEstudio);
//       if (response.result.result === "Estudios seleccionados") {
//         window.location.href = "/miPerfil";
//       } else {
//         alert(response.result.result);
//       }
//     } catch (error) {
//       console.error("Error en la solicitud:", error);
//     }
//   };

console.log(asignaturas)

  return (
    <>
      <Navbar />
      <div style={{ marginTop: "60px" }}>
        <p className="titulo">Selecciona tus asignaturas:</p>
        <select multiple value = {selectedAsignaturas} onChange={handleSelectChangeAsignatura}>
          <option value="" disabled>
            Selecciona una o varias asignaturas
          </option>
          {asignaturas.map((asignatura,index) => (
            <option key={index} value={asignatura.nombre}>
              {estudio.nombre}
            </option>
          ))}
        </select>
        {/* <button onClick={handleSubmit} disabled={!selectedEstudio}>
          Enviar
        </button> */}
      </div>
      <Footer />
    </>
  );
}
