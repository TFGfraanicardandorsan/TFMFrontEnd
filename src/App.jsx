import "./App.css";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";
import { RoleRoute } from "./routes/RoleRoute.jsx";
import CookieConsent from "react-cookie-consent";
import Cookies from "./components/cookies.jsx";
import Login from "./components/login.jsx";
import Home from "./components/home.jsx";
import Unauthorized from "./components/Unauthorized.jsx";
import NotFound from "./components/notFound.jsx";
import ReportarIncidencia from "./components/reportarIncidencia.jsx";
import MisIncidencias from "./components/misIncidencias.jsx";
import MiPerfil from "./components/miPerfil.jsx";
import SeleccionarEstudio from "./components/seleccionarEstudio.jsx";
import SeleccionarAsignatura from "./components/selectorAsignatura.jsx";
import Incidencias from "./components/incidencias.jsx";
import GeneracionPDF from "./components/generacionPDF.jsx";
import SolicitarGrupos from "./components/seleccionarGrupos.jsx";
import PoliticaPrivacidad from "./components/politicaPrivacidad.jsx";
import CrearNotificacion from "./components/crearNotificacion.jsx";
import SolicitarPermuta from "./components/solicitarPermuta.jsx";
import MisSolicitudesPermuta from "./components/misPermutas.jsx";
export function App() {
  return (
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/cookies" element={<Cookies />} />

          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/miPerfil" element={<RoleRoute allowedRoles={["estudiante"]}><MiPerfil /></RoleRoute>} />
          <Route path="/reportarIncidencia" element={<ReportarIncidencia />} />
          <Route path="/misIncidencias" element={<MisIncidencias />} />
          <Route path="/seleccionarEstudios" element={<SeleccionarEstudio />} />
          <Route path="/seleccionarAsignaturas" element={<SeleccionarAsignatura />} />
          <Route path="/incidencias" element={<Incidencias />} />
          <Route path="/generarPermuta" element={<GeneracionPDF />} />
          <Route path="/seleccionarGrupos" element={<SolicitarGrupos />} />
          <Route path="/politicaPrivacidad" element={<PoliticaPrivacidad />} />
          <Route path="/crearNotificacion" element={<CrearNotificacion />} />
          <Route path="/solicitarPermuta" element={<SolicitarPermuta />} />
          <Route path="/misSolicitudesPermuta" element={<MisSolicitudesPermuta />} />
        </Routes>

        <CookieConsent location="top" buttonText="Aceptar" cookieName="permutasCookies" style={{ background: "#2B373B",padding: "1rem" }} 
          buttonStyle={{ color: "#fff",  background: "#2b579a", padding: "8px 16px",
          margin: "auto", border: "none", borderRadius: "4px" }} expires={150} >
          Utilizamos cookies para mejorar la experiencia del usuario.
          <a href="/cookies" style={{ color: "#ffd700", textDecoration: "underline", marginLeft: "5px" }}>Leer más</a>
        </CookieConsent>
      
      </AuthProvider>
  );
}
export default App;
