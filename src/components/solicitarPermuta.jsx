import { useState, useEffect } from "react";
import Footer from "./footer";
import Navbar from "./navbar";
import { obtenerTodosGruposMisAsignaturasSinGrupoUsuario } from "../services/grupo.js";
import "../styles/seleccionarGrupos-style.css";

export default function SeleccionarGruposSinGrupo() {
  const [asignaturas, setAsignaturas] = useState([]);
  const [seleccionados, setSeleccionados] = useState({});

  useEffect(() => {
    const ObtenerTodosGruposMisAsignaturasSinGrupoUsuario = async () => {
      try {
        const response = await obtenerTodosGruposMisAsignaturasSinGrupoUsuario();
        if (response && response.result) {
          const agrupadas = response.result.reduce((acc, item) => {
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
        console.error(
          "Error al obtener las asignaturas sin grupo del usuario:",
          error
        );
      }
    };

    ObtenerTodosGruposMisAsignaturasSinGrupoUsuario();
  }, []);

  const handleGrupoSeleccionadoParaAsignatura = (codasignatura, numGrupo) => {
    setSeleccionados((prev) => ({
      ...prev,
      [codasignatura]: numGrupo,
    }));
  };

  const handleSubmit = async () => {
    console.log("Grupos seleccionados:", seleccionados);
    // Aquí puedes agregar la lógica para enviar los datos al backend si es necesario
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
          Solicitar
        </button>
      </div>
      <Footer />
    </>
  );
}