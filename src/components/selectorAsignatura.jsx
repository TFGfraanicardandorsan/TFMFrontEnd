import { useState, useEffect } from "react";
import { obtenerAsignaturasEstudio } from "../services/asignaturas";
//import "../styles/selectorAsignatura-style.css"; // Corrección del nombre del archivo
import Navbar from "./navbar";

export default function CheckboxSelector() {
  const [asignaturas, setAsignatura] = useState([]); // Estado para las asignaturas
  const [selectedItems, setSelectedItems] = useState([]); // Estado para los checkboxes seleccionados

  // Obtener opciones desde la API
  useEffect(() => {
    const fetchAsignaturas = async () => {
      try {
        const response = await obtenerAsignaturasEstudio();
        if (!response.err) {
          setAsignatura(response.result.result); // Corrección: setAsignatura en lugar de setEstudio
        } else {
          console.error("Error al obtener las asignaturas:", response.errmsg);
        }
      } catch (error) {
        console.error("Error en la API:", error);
      }
    };

    fetchAsignaturas();
  }, []);

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
        <h2 className="checkbox-title">Selecciona opciones:</h2>
        <div className="checkbox-list">
          {asignaturas.map((asignatura) => (
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
