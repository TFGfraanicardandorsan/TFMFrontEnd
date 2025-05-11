import { useState, useEffect } from "react";
import "../styles/miPerfil-style.css";
import { verListaPermutas } from "../services/permuta";
import { useNavigate } from "react-router-dom";

export default function MiPerfilAdmin() {
  const [usuario, setUsuario] = useState(null); // Datos ficticios del administrador
  const [permutas, setPermutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

 useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Obtener datos del administrador
        const responseUsuario = await obtenerDatosUsuarioAdmin();
        if (!responseUsuario.err) {
          setUsuario(responseUsuario.result.result); // Asume que los datos están en `result.result`
        } else {
          throw new Error(responseUsuario.errmsg);
        }

        // Obtener lista de permutas
        const responsePermutas = await verListaPermutas();
        if (!responsePermutas.err) {
          setPermutas(responsePermutas.result.result); // Asume que los datos están en `result.result`
        } else {
          throw new Error(responsePermutas.errmsg);
        }

        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const exportarCSV = () => {
    if (permutas.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }


    const encabezados = Object.keys(permutas[0]).join(","); // Generar encabezados del CSV
    const filas = permutas.map((permuta) =>
      Object.values(permuta).map((valor) => `"${valor}"`).join(",")
    );
    const contenidoCSV = [encabezados, ...filas].join("\n");

    const blob = new Blob([contenidoCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "permutas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="loading-text">Cargando datos...</div>;
  }

  if (error) {
    return <div className="error-text">Error: {error}</div>;
  }

  return (
    <div className="page-container">
      <div className="content-wrap">
        <div className="perfil-container">
          <h1 className="perfil-title">Perfil de Administrador</h1>
          <div className="perfil-content">
            <div className="perfil-card">
              <h2 className="perfil-card-title">Información Personal</h2>
              <p><strong>Nombre:</strong> {usuario.nombre}</p>
              <p><strong>Correo:</strong> {usuario.correo}</p>
            </div>

            <div className="perfil-card">
              <h2 className="perfil-card-title">Exportar Permutas</h2>
              <button className="exportar-btn" onClick={exportarCSV}>
                Exportar Permutas en CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}