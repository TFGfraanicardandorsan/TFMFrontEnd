import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale,BarElement,Title,Tooltip,Legend,ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { obtenerEstadisticasPermutas, obtenerEstadisticasSolicitudes } from '../services/estadisticas';
import Navbar from './navbar';
import Footer from './footer';
import "../styles/estadisticas-style.css";

ChartJS.register( CategoryScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Estadisticas() {
  const [estadisticasPermutas, setEstadisticasPermutas] = useState(null);
  const [estadisticasSolicitudes, setEstadisticasSolicitudes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const [permutasData, solicitudesData] = await Promise.all([
          obtenerEstadisticasPermutas(),
          obtenerEstadisticasSolicitudes()
        ]);
        
        console.log(permutasData, solicitudesData);
        setEstadisticasPermutas(permutasData.result.data);
        setEstadisticasSolicitudes(solicitudesData.result.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar las estadísticas', err);
        setLoading(false);
      }
    };

    cargarEstadisticas();
  }, []);

  if (loading) return <div>Cargando estadísticas...</div>;
  if (error) return <div>{error}</div>;

  const permutasPorEstadoData = {
    labels: estadisticasPermutas.permutasPorEstado.map(item => item.estado),
    datasets: [{
      label: 'Permutas por Estado',
      data: estadisticasPermutas.permutasPorEstado.map(item => item.cantidad),
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
      ],
    }]
  };

  const permutasPorAsignaturaData = {
    labels: estadisticasPermutas.permutasPorAsignatura.map(item => item.nombre),
    datasets: [{
      label: 'Permutas por Asignatura',
      data: estadisticasPermutas.permutasPorAsignatura.map(item => item.cantidad),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
    }]
  };

  const solicitudesPorEstadoData = {
    labels: estadisticasSolicitudes.solicitudesPorEstado.map(item => item.estado),
    datasets: [{
      data: estadisticasSolicitudes.solicitudesPorEstado.map(item => item.cantidad),
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
      ],
    }]
  };

  return (
    <>
      <Navbar />
      <div className="estadisticas-container">
        <h1>Dashboard de Estadísticas</h1>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h2>Permutas por Estado</h2>
            <Pie data={permutasPorEstadoData} />
          </div>

          <div className="stat-card">
            <h2>Permutas por Asignatura</h2>
            <Bar data={permutasPorAsignaturaData} />
          </div>

          <div className="stat-card">
            <h2>Tiempo Promedio de Permuta</h2>
            <div className="stat-value">
              {Math.round(estadisticasPermutas.tiempoPromedioPermuta.dias_promedio)} días
            </div>
          </div>

          <div className="stat-card">
            <h2>Solicitudes por Estado</h2>
            <Pie data={solicitudesPorEstadoData} />
          </div>

          <div className="stat-card">
            <h2>Ratio de Aceptación</h2>
            <div className="stat-value">
              {Math.round(estadisticasSolicitudes.ratioAceptacion.porcentaje_aceptacion)}%
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}