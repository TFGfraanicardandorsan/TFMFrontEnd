import "../styles/selectorAsignatura-style.css";
import { useState, useEffect } from "react";
import { obtenerAsignaturasEstudio , actualizarAsignaturasUsuario} from "../../services/asignaturas";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { logError } from "../../lib/logger";
export default function SelectorAsignatura() {
  const [asignaturas, setAsignatura] = useState([]); // Estado para todas las asignaturas
  const [filteredAsignaturas, setFilteredAsignaturas] = useState([]); // Estado para las asignaturas filtradas
  const [selectedItems, setSelectedItems] = useState([]); // Estado para los checkboxes seleccionados
  const [cursos, setCursos] = useState([]); // Estado para los cursos disponibles
  const [cursoSeleccionado, setCursoSeleccionado] = useState(""); // Estado para el curso seleccionado
  const [loading, setLoading] = useState(false); // Estado de carga mientras se envían datos
  const navigate = useNavigate();

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
          logError(response.errmsg);
        }
      } catch (error) {
        logError(error);
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

  const enviarSeleccion = async () => {
    if (selectedItems.length === 0) return;
    setLoading(true); 
    for (const codigo of selectedItems) {
      try {
        await actualizarAsignaturasUsuario(codigo);
      } catch (error) {
        logError(`Error al enviar la asignatura ${codigo}: ${error}`);
      }
    }
    setLoading(false); 
    toast.success("Todas las asignaturas seleccionadas han sido enviadas.");
    navigate("/seleccionarGrupos");
  };

  if (loading) {
    return <div className="loading-text">Cargando...</div>;
  }

  return (
    <>
      <div className="checkbox-container">
        <h2 className="checkbox-title">Selecciona asignaturas por curso:</h2>

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
        <button className="submit-button" onClick={enviarSeleccion} disabled={selectedItems.length === 0}> 
          Guardar
        </button>
      </div>
      <div style={{ height: "80px" }} />
    </>
  );
}
