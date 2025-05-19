import { useState, useEffect } from "react";
import { obtenerTodosGruposMisAsignaturasSinGrupoUsuario } from "../services/grupo.js";
import { solicitarPermuta } from "../services/permuta.js";
import { useNavigate } from "react-router-dom";
import "../styles/seleccionarGrupos-style.css";

export default function SeleccionarGruposSinGrupo() {
  const [asignaturas, setAsignaturas] = useState([]);
  const [seleccionados, setSeleccionados] = useState({});
  const [cargando, setCargando] = useState(true);
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
          console.error("No se encontraron asignaturas disponibles.");
        }
      } catch (error) {
        console.error(
          "Error al obtener las asignaturas sin grupo del usuario:",
          error
        );
      } finally {
        setCargando(false);
      }
    };

    ObtenerTodosGruposMisAsignaturasSinGrupoUsuario();
  }, []);

  const handleGrupoSeleccionado = (codasignatura, numgrupo) => {
    setSeleccionados((prev) => {
      const gruposSeleccionados = prev[codasignatura] || [];
      if (gruposSeleccionados.includes(numgrupo)) {
        return {
          ...prev,
          [codasignatura]: gruposSeleccionados.filter((g) => g !== numgrupo),
        };
      } else {
        return {
          ...prev,
          [codasignatura]: [...gruposSeleccionados, numgrupo],
        };
      }
    });
  };

  const handleSubmit = async () => {
    try {
      for (const [codasignatura, gruposDeseados] of Object.entries(seleccionados)) {
        if (gruposDeseados.length > 0) {
          await solicitarPermuta(codasignatura, gruposDeseados);
        }
      }
      alert("Permutas solicitadas con éxito.");
      navigate("/misSolicitudesPermuta");
    } catch (error) {
      console.error("Error al enviar las solicitudes de permuta:", error);
      alert("Ocurrió un error al solicitar las permutas. Intenta nuevamente.");
    }
  };

  const isSubmitDisabled = Object.values(seleccionados).every(
    (grupos) => grupos.length === 0
  );

  return (
    <>
    <br />
    <br />
      <div className="contenedor">
        <h2 className="titulo">Selecciona tus grupos</h2>
        <p className="subtitulo">
          Selecciona los grupos de las asignaturas que quieres permutar. Puedes
          seleccionar varios grupos de la misma asignatura. Puedes seleccionar más de una asignatura.
          <br />
        </p>
        {cargando ? (
          <p className="loading-message">Cargando asignaturas...</p>
        ) : (
          <div className="tarjetas-grid">
            {asignaturas.map(({ codasignatura, nombreasignatura, grupos }) => (
              <div key={parseInt(codasignatura)} className="tarjeta">
                <h3 className="nombre-asignatura">{nombreasignatura}</h3>
                <div className="checkbox-grupos">
                  {grupos.map((grupo) => (
                    <label key={grupo} className="checkbox-label">
                      <input
                        type="checkbox"
                        value={grupo}
                        checked={
                          seleccionados[parseInt(codasignatura)]?.includes(grupo) || false
                        }
                        onChange={() =>
                          handleGrupoSeleccionado(parseInt(codasignatura), grupo)
                        }
                      />
                      Grupo {grupo}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={handleSubmit}
          className="boton-guardar"
          disabled={isSubmitDisabled}
        >
          Solicitar
        </button>
      </div>
    </>
  );
}