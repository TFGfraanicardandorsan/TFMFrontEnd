import './App.css';
import {Routes, Route, /*Navigate*/} from "react-router-dom";
import Login from './components/login.jsx'
import Home from './components/home.jsx'
import ReportarIncidencia from './components/reportarIncidencia.jsx'
import MisIncidencias from './components/misIncidencias.jsx'
import MiPerfil from './components/miPerfil.jsx'
import SeleccionarEstudio from './components/seleccionarEstudio.jsx'
import ProtectedRoute from "./components/protectedRoute.jsx";

export function App() {

  return (
    <>
      <Routes>
        <Route path='/login' element={<Login/>} />
        <Route path='/' element={<Home/>} />
        <Route path='/reportarIncidencia' element={
          <ProtectedRoute>
          <ReportarIncidencia/>
          </ProtectedRoute>
          } />
        <Route path='/misIncidencias' element={
          <ProtectedRoute>
          <MisIncidencias/>
          </ProtectedRoute>} />
        <Route path='/miPerfil' element={
          <ProtectedRoute>
          <MiPerfil/>
          </ProtectedRoute>} />

        <Route path='/seleccionarEstudios' element={
          <ProtectedRoute>
          <SeleccionarEstudio/>
          </ProtectedRoute>} />
      </Routes>
    </>
  )
}

export default App
