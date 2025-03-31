import './App.css';
import {Routes, Route, /*Navigate*/} from "react-router-dom";
import Login from './components/login.jsx'
import Home from './components/home.jsx'
import ReportarIncidencia from './components/reportarIncidencia.jsx'
import MisIncidencias from './components/misIncidencias.jsx'
import MiPerfil from './components/miPerfil.jsx'
import SeleccionarEstudio from './components/seleccionarEstudio.jsx'
import SeleccionarAsignatura from './components/selectorAsignatura.jsx'
import Incidencias from './components/incidencias.jsx'
//import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from './components/notFound.jsx'
import GeneracionPDF from './components/generacionPDF.jsx';
import SolicitarGrupos from './components/seleccionarGrupos.jsx';
import PoliticaPrivacidad from './components/politicaPrivacidad.jsx';
import CrearNotificacion from './components/crearNotificacion.jsx';

export function App() {

  return (
    <>
      <Routes>
        <Route path='/login' element={<Login/>} />
        <Route path='/' element={<Home/>} />
        <Route path='/reportarIncidencia' element={<ReportarIncidencia/>} />
        <Route path='/misIncidencias' element={<MisIncidencias/>} />
        <Route path='/miPerfil' element={<MiPerfil/>} />
        <Route path='/seleccionarEstudios' element={<SeleccionarEstudio/>} />
        <Route path='/seleccionarAsignaturas' element={<SeleccionarAsignatura/>} />
        <Route path='/incidencias' element={<Incidencias/>} />
        <Route path='/generarPermuta' element={<GeneracionPDF/>} />
        <Route path = '/seleccionarGrupos' element={<SolicitarGrupos/>} />
        <Route path = '/politicaPrivacidad' element={<PoliticaPrivacidad/>} />
        <Route path= '/crearNotificacion' element={<CrearNotificacion/>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
