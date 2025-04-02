import { useState, useEffect } from "react";
import Footer from "./footer";
import Navbar from "./navbar";
import { obtenerTodosGruposMisAsignaturasUsuario, insertarMisGrupos } from "../services/grupo.js";
import "../styles/seleccionarGrupos-style.css";

export default function SeleccionarGrupos() {
  const [asignaturas, setAsignaturas] = useState([]);
  const [seleccionados, setSeleccionados] = useState({});

  useEffect(() => {
    const ObtenerTodosGruposMisAsignaturasUsuario = async () => {
      try {
        const response = await obtenerTodosGruposMisAsignaturasUsuario();
        if (response && response.result && response.result.result) {
          const asignaturasAgrupadas = response.result.result.reduce((acc, { nombreasignatura, numgrupo }) => {
            console.log(nombreasignatura, numgrupo);
            if (!acc[nombreasignatura]) {
              acc[nombreasignatura] = [];
            }
            acc[nombreasignatura].push(numgrupo);
            return acc;
          }, {});
          const asignaturasArray = Object.entries(asignaturasAgrupadas).map(([asignatura, grupos]) => ({
            asignatura,
            grupos
          }));
          setAsignaturas(asignaturasArray);
        }
      } catch (error) {
        console.error("Error al obtener las asignaturas del usuario:", error);
      }
    };
    ObtenerTodosGruposMisAsignaturasUsuario();
  }, []);

  const handleGrupoSeleccionadoParaAsignatura = (codigoAsignatura,numGrupo) => {
    setSeleccionados((prev) => ({...prev, [codigoAsignatura]: numGrupo }));
  };


  const handleSubmit = async () => {
    for (let [codigoAsignatura, numGrupo] of Object.entries(seleccionados)) {
      try {
        await insertarMisGrupos(numGrupo, codigoAsignatura);
        console.log(`Grupo ${numGrupo} para la asignatura ${codigoAsignatura} insertado correctamente.`);
      } catch (error) {
        console.error(`Error al insertar grupo ${numGrupo} para la asignatura ${codigoAsignatura}:`, error);
      }
    }
  };

  return (
    <>
  <Navbar/>
    <div className="contenedor">
      <h2 className="titulo">Selecciona tus grupos</h2>
      {asignaturas.map(({ nombreAsignatura, grupos }) => (
        <div key={nombreAsignatura} className="tarjeta">
          <h3 className="nombre-asignatura">{nombreAsignatura}</h3>
          <div className="grupo-lista">
            {grupos.map((numGrupo) => (
              <label key={numGrupo} className="grupo-opcion">
                <input
                  type="radio"
                  name={nombreAsignatura}
                  checked={seleccionados[nombreAsignatura] === numGrupo}
                  onChange={() => handleGrupoSeleccionadoParaAsignatura(nombreAsignatura, numGrupo)}
                />
                Grupo {numGrupo}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button onClick={handleSubmit} className="boton-guardar">
        Guardar
      </button>
    </div>
    <Footer/>
    </>
  );
}
