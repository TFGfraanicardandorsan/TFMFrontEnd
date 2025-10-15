import { useState, useEffect } from "react";
import "../styles/miPerfil-style.css";
import { getTodasSolicitudesPermuta  } from "../../services/permuta";
import { obtenerDatosUsuarioAdmin } from "../../services/usuario"; 
import { toast } from "react-toastify";
import CrearGradoAdmin from "./CrearGradoAdmin";
import CrearAsignatura from "./CrearAsignatura";
import ImportAsignaturas from "./importAsignaturas"; 

export default function MiPerfilAdmin() {
  const [usuario, setUsuario] = useState(null); 
  const [permutas, setPermutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const responseUsuario = await obtenerDatosUsuarioAdmin();
        if (!responseUsuario.err) {
          setUsuario(responseUsuario.result.result); 
        } else {
          throw new Error(responseUsuario.errmsg);
        }

        // Obtener lista de permutas
        const responsePermutas = await getTodasSolicitudesPermuta();
        if (!responsePermutas.err) {
          setPermutas(responsePermutas.result.result); 
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
      toast.warning("No hay datos para exportar.");
      return;
    }

    const datosAplanados = permutas.map((permuta) => ({
      solicitud_id: permuta.solicitud_id,
      nombre_completo: permuta.usuario.nombre_completo,
      uvus: permuta.usuario.uvus,
      estudio: permuta.usuario.estudio,
      asignatura_nombre: permuta.asignatura.nombre,
      asignatura_codigo: permuta.asignatura.codigo,
      grupo_solicitante: permuta.grupo_solicitante,
      grupos_deseados: permuta.grupos_deseados.join(" | "), 
    }));

    const encabezados = Object.keys(datosAplanados[0]).join(",");
    const filas = datosAplanados.map((fila) =>
      Object.values(fila).map((valor) => `"${valor}"`).join(",")
    );
    const contenidoCSV = [encabezados, ...filas].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + contenidoCSV], { type: "text/csv;charset=utf-8;" });
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
          <p className="perfil-subtitle">
            Aquí puedes exportar la información de las permutas a través de un CSV.
            <br />
            Además, puedes crear nuevos grados y asignaturas.
          </p>
          <div className="perfil-content">
            <div className="perfil-card">
              <h2 className="perfil-card-title">Información Personal</h2>
              <p><strong>Nombre:</strong> {usuario?.nombre_completo}</p>
              <p><strong>Correo:</strong> {usuario?.correo}</p>
            </div>

            <div className="perfil-card">
              <h2 className="perfil-card-title">Exportar Permutas</h2>
              <button className="exportar-btn" onClick={exportarCSV}>
                Exportar Permutas en CSV
              </button>
            </div>
          </div>
          <div className="perfil-card">
            <h2 className="perfil-card-title">Importar Asignaturas</h2>
            <ImportAsignaturas />
          </div>
          <div className="perfil-card">
            <h2 className="perfil-card-title">Crear nuevo Grado</h2>
            <CrearGradoAdmin />
          </div>
          <div className="perfil-card">
            <h2 className="perfil-card-title">Crear nueva Asignatura</h2>
            <CrearAsignatura />
          </div>
        </div>
      </div>
      <div style={{ height: "80px" }} />
    </div>
  );
}