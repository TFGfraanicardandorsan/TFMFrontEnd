import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { obtenerEstadisticasPermutas, obtenerEstadisticasSolicitudes, obtenerEstadisticasIncidencias } from '../services/estadisticas';
import "../styles/estadisticas-style.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Estadisticas() {
  const [estadisticasPermutas, setEstadisticasPermutas] = useState(null);
  const [estadisticasSolicitudes, setEstadisticasSolicitudes] = useState(null);
  const [estadisticasIncidencias, setEstadisticasIncidencias] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const [permutasData, solicitudesData, incidenciasData] = await Promise.all([
          obtenerEstadisticasPermutas(),
          obtenerEstadisticasSolicitudes(),
          obtenerEstadisticasIncidencias()
        ]);
        setEstadisticasPermutas(permutasData.result.data);
        setEstadisticasSolicitudes(solicitudesData.result.data);
        setEstadisticasIncidencias(incidenciasData.result);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar las estadísticas');
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

  const incidenciasPorEstadoData = {
    labels: estadisticasIncidencias.incidenciasPorEstado.map(item => item.estado),
    datasets: [{
      label: 'Incidencias por Estado',
      data: estadisticasIncidencias.incidenciasPorEstado.map(item => item.cantidad),
      backgroundColor: [
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 159, 64, 0.5)',
      ],
    }]
  };

  const incidenciasPorTipoData = {
    labels: estadisticasIncidencias.incidenciasPorTipo.map(item => item.tipo),
    datasets: [{
      label: 'Incidencias por Tipo',
      data: estadisticasIncidencias.incidenciasPorTipo.map(item => item.cantidad),
      backgroundColor: [
        'rgba(75, 192, 192, 0.5)',
        'rgba(255, 205, 86, 0.5)',
      ],
    }]
  };

  const incidenciasPorMesData = {
    labels: estadisticasIncidencias.incidenciasPorMes.map(item => `${item.mes}/${item.anio}`),
    datasets: [{
      label: 'Incidencias por Mes',
      data: estadisticasIncidencias.incidenciasPorMes.map(item => item.cantidad),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
    }]
  };

  return (
    <>
      <div className="estadisticas-container">
        <h1>Dashboard de Estadísticas</h1>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h2>Permutas por Estado</h2>
            <Pie key="permutasPorEstadoData" data={permutasPorEstadoData} />
          </div>

          <div className="stat-card">
            <h2>Permutas por Asignatura</h2>
            <Bar key="permutasPorAsignaturaData" data={permutasPorAsignaturaData} />
          </div>

          <div className="stat-card">
            <h2>Solicitudes por Estado</h2>
            <Pie key="solicitudesPorEstadoData" data={solicitudesPorEstadoData} />
          </div>

          <div className="stat-card">
            <h2>Incidencias por Estado</h2>
            <Pie key="incidenciasPorEstadoData" data={incidenciasPorEstadoData} />
          </div>

          <div className="stat-card">
            <h2>Incidencias por Tipo</h2>
            <Bar key="incidenciasPorTipoData" data={incidenciasPorTipoData} />
          </div>

          <div className="stat-card">
            <h2>Incidencias por Mes</h2>
            <Bar key="incidenciasPorMesData" data={incidenciasPorMesData} />
          </div>
        </div>
      </div>
    </>
  );
}