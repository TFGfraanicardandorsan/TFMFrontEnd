import "../styles/slectorAsignatura-style.css";
import { useState, useEffect } from "react";
import { obtenerAsignaturasEstudio } from "../services/asignaturas";
import Navbar from "./navbar";

export default function CheckboxSelector() {
  const [asignaturas, setAsignatura] = useState([]); // Estado para todas las asignaturas
  const [filteredAsignaturas, setFilteredAsignaturas] = useState([]); // Estado para las asignaturas filtradas
  const [selectedItems, setSelectedItems] = useState([]); // Estado para los checkboxes seleccionados
  const [cursos, setCursos] = useState([]); // Estado para los cursos disponibles
  const [cursoSeleccionado, setCursoSeleccionado] = useState(""); // Estado para el curso seleccionado

  // Obtener asignaturas desde la API
  useEffect(() => {
    const fetchAsignaturas = async () => {
      try {
        const response = await obtenerAsignaturasEstudio();
        if (!response.err) {
          const asignaturasData = response.result.result;
          setAsignatura(asignaturasData);

          // Obtener cursos únicos
          const cursosUnicos = [...new Set(asignaturasData.map((a) => a.curso))];
          setCursos(cursosUnicos);

          // Preseleccionar el primer curso por defecto
          setCursoSeleccionado(cursosUnicos[0]);
        } else {
          console.error("Error al obtener las asignaturas:", response.errmsg);
        }
      } catch (error) {
        console.error("Error en la API:", error);
      }
    };

    fetchAsignaturas();
  }, []);

  // Filtrar asignaturas según el curso seleccionado
  useEffect(() => {
    if (cursoSeleccionado) {
      const asignaturasFiltradas = asignaturas.filter(
        (a) => a.curso === cursoSeleccionado
      );
      setFilteredAsignaturas(asignaturasFiltradas);
    }
  }, [cursoSeleccionado, asignaturas]);

  // Manejar cambios en los checkboxes
  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    setSelectedItems((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  // Llamada a la API cuando cambia la selección
  useEffect(() => {
    if (selectedItems.length > 0) {
      fetchData(selectedItems);
    }
  }, [selectedItems]);

  // Función para hacer la petición a la API
  const fetchData = async (selected) => {
    try {
      const response = await fetch("https://api.example.com/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedItems: selected }),
      });

      const data = await response.json();
      console.log("Respuesta de la API:", data);
    } catch (error) {
      console.error("Error al llamar a la API:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="checkbox-container">
        <h2 className="checkbox-title">Selecciona asignaturas por curso:</h2>

        {/* Selector de curso */}
        <div className="curso-selector">
          <label htmlFor="curso">Filtrar por curso:</label>
          <select
            id="curso"
            value={cursoSeleccionado}
            onChange={(e) => setCursoSeleccionado(e.target.value)}
            className="curso-dropdown"
          >
            {cursos.map((curso) => (
              <option key={curso} value={curso}>
                {curso}
              </option>
            ))}
          </select>
        </div>

        {/* Lista de asignaturas filtradas */}
        <div className="checkbox-list">
          {filteredAsignaturas.map((asignatura) => (
            <label key={asignatura.codigo} className="checkbox-label">
              <input
                type="checkbox"
                value={asignatura.codigo}
                onChange={handleCheckboxChange}
                className="checkbox-input"
              />
              <span className="checkbox-text">{asignatura.nombre}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
