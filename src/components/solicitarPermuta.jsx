import { useState, useEffect } from "react";
import Footer from "./footer";
import Navbar from "./navbar";
import { obtenerTodosGruposMisAsignaturasSinGrupoUsuario } from "../services/grupo.js";
import { solicitarPermuta } from "../services/permuta.js";
import "../styles/seleccionarGrupos-style.css";

export default function SeleccionarGruposSinGrupo() {
  const [asignaturas, setAsignaturas] = useState([]);
  const [seleccionados, setSeleccionados] = useState({});

  useEffect(() => {
    const ObtenerTodosGruposMisAsignaturasSinGrupoUsuario = async () => {
      try {
        const response = await obtenerTodosGruposMisAsignaturasSinGrupoUsuario();
        console.log("Respuesta completa de la API:", response); // Depuración
        console.log("Contenido de response.result:", response.result.result); // Depuración
  
        if (response && Array.isArray(response.result.result)) {
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
        } else {
          console.error("response.result no es un array o está vacío.");
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
    try {
      const uvus = "usuarioEjemplo"; // Reemplaza con el UVUS del usuario autenticado
  
      // Iterar sobre las asignaturas seleccionadas
      for (const [codasignatura, gruposDeseados] of Object.entries(seleccionados)) {
        if (gruposDeseados.length > 0) {
          // Enviar la solicitud al backend para cada asignatura
          const response = await solicitarPermuta(codasignatura, gruposDeseados);
          console.log(`Respuesta del backend para ${codasignatura}:`, response);
        }
      }
  
      alert("Permutas solicitadas con éxito.");
    } catch (error) {
      console.error("Error al enviar las solicitudes de permuta:", error);
      alert("Ocurrió un error al solicitar las permutas. Intenta nuevamente.");
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
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <Footer />
    </>
  );
}