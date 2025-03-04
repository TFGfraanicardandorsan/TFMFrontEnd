import './App.css';
import {Routes, Route, /*Navigate*/} from "react-router-dom";
import Login from './components/login.jsx'
import Home from './components/home.jsx'
import ReportarIncidencia from './components/reportarIncidencia.jsx'


export function App() {

  return (
    <>
      <Routes>
        <Route path='/login' element={<Login/>} />
        <Route path='/home' element={<Home/>} />
        <Route path='/reportarIncidencia' element={<ReportarIncidencia/>} />
      </Routes>
    </>
  )
}

export default App
