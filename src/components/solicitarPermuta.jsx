import { useState, useEffect } from "react";
import Footer from "./footer";
import Navbar from "./navbar";
import { obtenerTodosGruposMisAsignaturasSinGrupoUsuario } from "../services/grupo.js";
import "../styles/seleccionarGrupos-style.css";

export default function SeleccionarGruposSinGrupo() {
  const [asignaturas, setAsignaturas] = useState([]);
  const [seleccionados, setSeleccionados] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ObtenerTodosGruposMisAsignaturasSinGrupoUsuario = async () => {
      try {
        const response = await obtenerTodosGruposMisAsignaturasSinGrupoUsuario();
        console.log("Respuesta de la API:", response); // Depuración
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
        } else {
          setError("No se encontraron asignaturas.");
        }
      } catch (error) {
        console.error(
          "Error al obtener las asignaturas sin grupo del usuario:",
          error
        );
        setError("Ocurrió un error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    ObtenerTodosGruposMisAsignaturasSinGrupoUsuario();
  }, []);

  const handleGrupoSeleccionado = (codasignatura, numgrupo) => {
    setSeleccionados((prev) => {
      const gruposSeleccionados = prev[codasignatura] || [];
      if (gruposSeleccionados.includes(numgrupo)) {
        // Si ya está seleccionado, lo quitamos
        return {
          ...prev,
          [codasignatura]: gruposSeleccionados.filter((g) => g !== numgrupo),
        };
      } else {
        // Si no está seleccionado, lo agregamos
        return {
          ...prev,
          [codasignatura]: [...gruposSeleccionados, numgrupo],
        };
      }
    });
  };

  const handleSubmit = async () => {
    console.log("Grupos seleccionados:", seleccionados);
    // Aquí puedes agregar la lógica para enviar los datos al backend si es necesario
  };

  if (loading) {
    return <p>Cargando asignaturas...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      <Navbar />
      <div className="contenedor">
        <h2 className="titulo">Selecciona tus grupos</h2>
        <div className="tarjetas-grid">
          {asignaturas.map(({ codasignatura, nombreasignatura, grupos }) => (
            <div key={codasignatura} className="tarjeta">
              <h3 className="nombre-asignatura">{nombreasignatura}</h3>
              <div className="checkbox-grupos">
                {grupos.map((grupo) => (
                  <label key={grupo} className="checkbox-label">
                    <input
                      type="checkbox"
                      value={grupo}
                      checked={
                        seleccionados[codasignatura]?.includes(grupo) || false
                      }
                      onChange={() =>
                        handleGrupoSeleccionado(codasignatura, grupo)
                      }
                    />
                    Grupo {grupo}
                  </label>
                ))}
              </div>
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