import "./App.css";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider.jsx";
import { RoleRoute } from "./routes/RoleRoute.jsx";
import CookieConsent from "react-cookie-consent";
import Cookies from "./components/cookies.jsx";
import Login from "./components/login.jsx";
import PoliticaPrivacidad from "./components/politicaPrivacidad.jsx";
import Unauthorized from "./components/Unauthorized.jsx";
import NotFound from "./components/notFound.jsx";
import LayoutEstudiante from "./layouts/LayoutEstudiante.jsx";
// import LayoutAdmin from "./layouts/LayoutAdmin.jsx";
import Home from "./components/home.jsx";
import MiPerfil from "./components/miPerfil.jsx";
import ReportarIncidencia from "./components/reportarIncidencia.jsx";
import MisIncidencias from "./components/misIncidencias.jsx";
import SeleccionarEstudio from "./components/seleccionarEstudio.jsx";
import SeleccionarAsignatura from "./components/selectorAsignatura.jsx";
import Incidencias from "./components/incidencias.jsx";
import GeneracionPDF from "./components/generacionPDF.jsx";
import SolicitarGrupos from "./components/seleccionarGrupos.jsx";
import SolicitarPermuta from "./components/solicitarPermuta.jsx";
import MisSolicitudesPermuta from "./components/misPermutas.jsx";
import Permutas from "./components/permutas.jsx";
import CrearNotificacion from "./components/crearNotificacion.jsx";
import Estadisticas from "./components/Estadisticas.jsx";
export function App() {
  return (
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/politicaPrivacidad" element={<PoliticaPrivacidad />} />
          <Route path="*" element={<NotFound />} />

          {/* Layout para estudiantes */}
          <Route element={<RoleRoute allowedRoles={["estudiante"]}><LayoutEstudiante /></RoleRoute>}>
          <Route path="/" element={<Home />} />
          <Route path="/miPerfil" element={<MiPerfil />} />
          <Route path="/seleccionarEstudios" element={<SeleccionarEstudio />} />
          <Route path="/seleccionarAsignaturas" element={<SeleccionarAsignatura />} />
          <Route path="/seleccionarGrupos" element={<SolicitarGrupos />} />
          <Route path="/misIncidencias" element={<MisIncidencias />} />
          <Route path="/reportarIncidencia" element={<ReportarIncidencia />} />
          <Route path="/incidencias" element={<Incidencias />} />
          <Route path="/generarPermuta" element={<GeneracionPDF />} />
          <Route path="/solicitarPermuta" element={<SolicitarPermuta />} />
          <Route path="/misSolicitudesPermuta" element={<MisSolicitudesPermuta />} />
          <Route path="/permutas" element={<Permutas />} />
          </Route>

          {/* Layout para administradores */}
          {/* <Route element={<RoleRoute allowedRoles={["administrador"]}><LayoutAdmin /></RoleRoute>}>
          <Route path="/" element={<Home />} />
          <Route path="/miPerfil" element={<MiPerfil />} />
          <Route path="/estadisticas" element={<Estadisticas />} /> 
          <Route path="/crearNotificacion" element={<CrearNotificacion />} />
          </Route> */}
        </Routes>

        <CookieConsent location="top" buttonText="Aceptar" cookieName="permutasCookies" expires={150} className="cookie-consent-container" >
          Utilizamos cookies para mejorar la experiencia del usuario.
          <a href="/cookies" className="cookie-consent-link">Leer más</a>
          <button className="cookie-consent-button">Aceptar</button>
        </CookieConsent>
      
      </AuthProvider>
  );
}
export default App;