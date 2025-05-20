import { useState, useEffect } from "react";
import { obtenerTodosGruposMisAsignaturasUsuario, insertarMisGrupos } from "../services/grupo.js";
import "../styles/seleccionarGrupos-style.css";
import { useNavigate } from "react-router-dom";

export default function SeleccionarGrupos() {
  const [asignaturas, setAsignaturas] = useState([]);
  const [seleccionados, setSeleccionados] = useState({});
  const [error, setError] = useState(""); // Estado para manejar errores
  const navigate = useNavigate();

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
    // Validar que todos los grupos estén seleccionados
    const asignaturasSinGrupo = asignaturas.filter(
      ({ codasignatura }) => !seleccionados[codasignatura]
    );

    if (asignaturasSinGrupo.length > 0) {
      setError("Por favor selecciona un grupo para todas las asignaturas.");
      return;
    }
    setError("");

    for (let [codasignatura, numgrupo] of Object.entries(seleccionados)) {
      try {
        await insertarMisGrupos(numgrupo, codasignatura);
      } catch (error) {
        console.error(
          `Error al insertar grupo ${numgrupo} para asignatura ${codasignatura}:`,
          error
        );
      }
    }
    navigate("/miPerfil");
  };

  return (
    <>
      <div className="contenedor">
        <h2 className="titulo">Selecciona tus grupos</h2>
        {error && <p className="error">{error}</p>}
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
        <button
          onClick={handleSubmit}
          className="boton-guardar"
          disabled={asignaturas.some(
            ({ codasignatura }) => !seleccionados[codasignatura]
          )}
        >
          Guardar
        </button>
      </div>
    </>
  );
}
