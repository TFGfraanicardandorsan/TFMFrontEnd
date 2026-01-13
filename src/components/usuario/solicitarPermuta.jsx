import { useState, useEffect } from "react";
import { obtenerTodosGruposMisAsignaturasSinGrupoUsuario } from "../../services/grupo.js";
import { solicitarPermuta } from "../../services/permuta.js";
import { useNavigate } from "react-router-dom";
import "../../../styles/seleccionarGrupos-style.css";
import { toast } from "react-toastify";
import { logError } from "../../lib/logger.js";

export default function SeleccionarGruposSinGrupo() {
  const [asignaturas, setAsignaturas] = useState([]);
  const [seleccionados, setSeleccionados] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ObtenerTodosGruposMisAsignaturasSinGrupoUsuario = async () => {
      try {
        setCargando(true);
        const response = await obtenerTodosGruposMisAsignaturasSinGrupoUsuario();

        if (response && Array.isArray(response.result.result)) {
          const agrupadas = response.result.result.reduce((acc, item) => {
            const { codasignatura, nombreasignatura, numgrupo } = item;
            if (!acc[parseInt(codasignatura)]) {
              acc[parseInt(codasignatura)] = {
                codasignatura,
                nombreasignatura,
                grupos: [],
              };
            }
            acc[codasignatura].grupos.push(numgrupo);
            return acc;
          }, {});

          setAsignaturas(Object.values(agrupadas));
        } else {
          logError("No se encontraron asignaturas disponibles.");
        }
      } catch (error) {
        logError(error);
        setError("Ocurrió un error al cargar las asignaturas.");
      } finally {
        setCargando(false);
      }
    };

    ObtenerTodosGruposMisAsignaturasSinGrupoUsuario();
  }, []);

  const handleGrupoSeleccionadoParaAsignatura = (codasignatura, numgrupo) => {
    setSeleccionados((prev) => ({
      ...prev,
      [codasignatura]: numgrupo,
    }));
  };

  const handleSubmit = async () => {
    try {
      for (const [codasignatura, grupoDeseado] of Object.entries(seleccionados)) {
        if (grupoDeseado) {
          await solicitarPermuta(codasignatura, [grupoDeseado]);
        }
      }
      toast.success("Permutas solicitadas con éxito.");
      navigate("/misSolicitudesPermuta");
    } catch (error) {
      toast.error("Ocurrió un error al solicitar las permutas. Intenta nuevamente.");
      logError(error);
    }
  };

  return (
    <>
      <br />
      <br />
      <div className="contenedor">
        <h2 className="titulo">Selecciona tus grupos</h2>
        {error && <p className="error">{error}</p>}
        {cargando ? (
          <p className="loading-message">Cargando asignaturas...</p>
        ) : (
          <div className="tarjetas-grid">
            {asignaturas.map(({ codasignatura, nombreasignatura, grupos }) => (
              <div key={parseInt(codasignatura)} className="tarjeta">
                <h3 className="nombre-asignatura">{nombreasignatura}</h3>
                <select
                  className="select-grupo"
                  value={seleccionados[parseInt(codasignatura)] || ""}
                  onChange={(e) =>
                    handleGrupoSeleccionadoParaAsignatura(
                      parseInt(codasignatura),
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
        )}
        <button
          onClick={handleSubmit}
          className="boton-guardar"
          disabled={asignaturas.some(
            ({ codasignatura }) => !seleccionados[parseInt(codasignatura)]
          )}
        >
          Solicitar
        </button>
      </div>
      <div style={{ height: "80px" }} />
    </>
  );
}