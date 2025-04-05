import { useState, useEffect } from "react";
import Footer from "./footer";
import Navbar from "./navbar";
import {
  obtenerTodosGruposMisAsignaturasUsuario,
  insertarMisGrupos,
} from "../services/grupo.js";
import "../styles/seleccionarGrupos-style.css";

export default function SeleccionarGrupos() {
  const [asignaturas, setAsignaturas] = useState([]);
  const [seleccionados, setSeleccionados] = useState({});

  useEffect(() => {
    const ObtenerTodosGruposMisAsignaturasUsuario = async () => {
      try {
        const response = await obtenerTodosGruposMisAsignaturasUsuario();
        if (response && response.result && response.result.result) {
          const agrupadas = response.result.result.reduce((acc, item) => {
            const { codasignatura, nombreasignatura, numgrupo } = item;
            if (!acc[codasignatura]) {
              acc[codasignatura] = {
                codasignatura,
                nombreasignatura,
                grupos: [],
              };
            }
            acc[codasignatura].grupos.push(numgrupo);
            return acc;
          }, {});

          setAsignaturas(Object.values(agrupadas));
        }
      } catch (error) {
        console.error("Error al obtener las asignaturas del usuario:", error);
      }
    };

    ObtenerTodosGruposMisAsignaturasUsuario();
  }, []);

  const handleGrupoSeleccionadoParaAsignatura = (codasignatura, numGrupo) => {
    setSeleccionados((prev) => ({
      ...prev,
      [codasignatura]: numGrupo,
    }));
  };

  const handleSubmit = async () => {
    for (let [codasignatura, numgrupo] of Object.entries(seleccionados)) {
      try {
        await insertarMisGrupos(numgrupo, codasignatura);
        console.log(
          `Insertado: Asignatura ${codasignatura}, Grupo ${numgrupo}`
        );
      } catch (error) {
        console.error(
          `Error al insertar grupo ${numgrupo} para asignatura ${codasignatura}:`,
          error
        );
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="contenedor">
        <h2 className="titulo">Selecciona tus grupos</h2>

        <div className="tarjetas-grid">
          {asignaturas.map(({ codasignatura, nombreasignatura, grupos }) => (
            <div key={codasignatura} className="tarjeta">
              <h3 className="nombre-asignatura">{nombreasignatura}</h3>
              <select
                className="select-grupo"
                value={seleccionados[codasignatura] || ""}
                onChange={(e) =>
                  handleGrupoSeleccionadoParaAsignatura(
                    codasignatura,
                    e.target.value
                  )
                }
              >
                <option value="" disabled>
                  -- Selecciona un grupo --
                </option>
                {grupos.map((grupo) => (
                  <option key={grupo} value={grupo}>
                    Grupo {grupo}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <button onClick={handleSubmit} className="boton-guardar">
          Guardar
        </button>
      </div>
      <Footer />
    </>
  );
}
