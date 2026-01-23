import { useState, useEffect } from "react";
import "../../styles/user-common.css";
// Mantenemos estilos específicos si son necesarios, pero priorizamos user-common
import "../../styles/permutas-style.css";
import { obtenerPermutasInteresantes, aceptarPermutaSolicitudesPermuta } from "../../services/permuta.js";
import { useNavigate } from "react-router-dom";
import { logError } from "../../lib/logger.js";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExchangeAlt, faCheck, faBookReader } from "@fortawesome/free-solid-svg-icons";

export default function Permutas() {
  const [permutas, setPermutas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarPermutas();
  }, []);

  const cargarPermutas = async () => {
    try {
      const response = await obtenerPermutasInteresantes();
      if (response && response.result && Array.isArray(response.result.result)) {
        setPermutas(response.result.result);
      } else {
        setError("Error al cargar los datos");
        logError(response);
      }
      setCargando(false);
    } catch (error) {
      setError("Error al cargar las permutas");
      setCargando(false);
      logError(error);
    }
  };

  const handleAceptarPermuta = async (solicitudId) => {
    try {
      await aceptarPermutaSolicitudesPermuta(solicitudId);
      toast.success("Permuta aceptada correctamente");
      navigate("/misPermutas");
    } catch (error) {
      toast.error("Error al aceptar la permuta");
      setError("Error al aceptar la permuta");
      logError(error);
    }
  };

  if (cargando) {
    return (
      <div className="page-container">
        <div className="user-loading">Cargando permutas interesantes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="user-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrap">
        <div className="page-header">
          <h1 className="page-title">Permutas Disponibles</h1>
          <p className="page-subtitle">
            Aquí encontrarás permutas compatibles con tu matrícula. Si ves alguna interesante,
            acepta la propuesta para iniciar el intercambio de grupo.
          </p>
        </div>

        {permutas.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {permutas.map((permuta) => (
              <div key={permuta.solicitud_id} className="user-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="permuta-info" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', color: 'var(--user-primary)' }}>
                    <FontAwesomeIcon icon={faBookReader} style={{ marginRight: '8px' }} />
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{permuta.siglas_asignatura}</h3>
                  </div>
                  <hr style={{ margin: '10px 0', borderColor: '#eee' }} />
                  <p><strong><FontAwesomeIcon icon={faExchangeAlt} /> Permuta:</strong> G.{permuta.grupo_solicitante} ➝ G.{permuta.grupo_deseado}</p>
                  <p style={{ marginTop: '5px', color: 'var(--text-secondary)' }}>
                    <small>Código: {permuta.codigo_asignatura}</small>
                  </p>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <button
                    className="btn btn-success btn-full"
                    onClick={() => handleAceptarPermuta(permuta.solicitud_id)}>
                    <FontAwesomeIcon icon={faCheck} /> Aceptar Propuesta
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="user-card empty-state" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📭</div>
            <h3>No hay permutas disponibles por el momento</h3>
            <p>Vuelve más tarde o crea tu propia solicitud de permuta.</p>
            <button className="btn btn-primary" onClick={() => navigate("/solicitarPermuta")} style={{ marginTop: '20px' }}>
              Solicitar una permuta
            </button>
          </div>
        )}
      </div>
      <div style={{ height: "80px" }} />
    </div>
  );
}
