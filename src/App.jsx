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
import RedirectHome from "./components/RedirectHome.jsx";
import LayoutEstudiante from "./layouts/LayoutEstudiante.jsx";
import LayoutAdmin from "./layouts/LayoutAdmin.jsx";
import Home from "./components/home.jsx";
import MiPerfil from "./components/miPerfil.jsx";
import ReportarIncidencia from "./components/reportarIncidencia.jsx";
import MisIncidencias from "./components/misIncidencias.jsx";
import SeleccionarEstudio from "./components/seleccionarEstudio.jsx";
import SeleccionarAsignatura from "./components/selectorAsignatura.jsx";
import GeneracionPDF from "./components/generacionPDF.jsx";
import SolicitarGrupos from "./components/seleccionarGrupos.jsx";
import SolicitarPermuta from "./components/solicitarPermuta.jsx";
import MisSolicitudesPermuta from "./components/solicitudesPermuta.jsx";
import Permutas from "./components/permutas.jsx";
import CrearNotificacion from "./components/crearNotificacion.jsx";
import Estadisticas from "./components/Estadisticas.jsx";
import MisPermutas from "./components/misPermutas.jsx";
import PermutasAceptadas from "./components/permutasAceptadas.jsx";
import IncidenciasSinAsignar from "./components/incidenciasSinAsignar.jsx";
import IncidenciasAsignadasAdmin from "./components/incidenciasAsignadasAdmin.jsx";
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

          {/* Redirigir al home adecuado dependiendo del rol */}
          <Route path="/" element={<RoleRoute allowedRoles={["administrador", "estudiante"]}><RedirectHome /></RoleRoute>}/>
          {/* Layout para estudiantes */}
          <Route element={<RoleRoute allowedRoles={["estudiante"]}><LayoutEstudiante /></RoleRoute>}>
          <Route path="/estudiante" element={<Home />} />
          <Route path="/miPerfil" element={<MiPerfil />} />
          <Route path="/seleccionarEstudios" element={<SeleccionarEstudio />} />
          <Route path="/seleccionarAsignaturas" element={<SeleccionarAsignatura />} />
          <Route path="/seleccionarGrupos" element={<SolicitarGrupos />} />
          <Route path="/misIncidencias" element={<MisIncidencias />} />
          <Route path="/reportarIncidencia" element={<ReportarIncidencia />} />
          <Route path="/generarPermuta" element={<GeneracionPDF />} />
          <Route path="/permutasAceptadas" element={<PermutasAceptadas />} />
          <Route path="/misPermutas" element={<MisPermutas />} />
          <Route path="/solicitarPermuta" element={<SolicitarPermuta />} />
          <Route path="/misSolicitudesPermuta" element={<MisSolicitudesPermuta />} />
          <Route path="/permutas" element={<Permutas />} />
          </Route>

          {/* Layout para administradores */}
          <Route element={<RoleRoute allowedRoles={["administrador"]}><LayoutAdmin /></RoleRoute>}>
          <Route path="/admin" element={<Home />} />
          <Route path="/estadisticas" element={<Estadisticas />} /> 
          <Route path="/incidenciasSinAsignar" element={<IncidenciasSinAsignar />} />
          <Route path="/incidencias" element={<IncidenciasAsignadasAdmin />} />
          <Route path="/crearNotificacion" element={<CrearNotificacion />} />

          </Route>
        </Routes>

        <CookieConsent location="bottom" buttonText="Aceptar" cookieName="permutasCookies" style={{ background: "#6099c4",padding: "1rem" }} 
          buttonStyle={{ color: "#fff",  background: "#E0AD0F", padding: "8px 16px",
          margin: "auto", border: "none", borderRadius: "4px" }} expires={150} >
          Utilizamos cookies para mejorar la experiencia del usuario.
          <a href="/cookies" style={{ color: "#E0AD0F", textDecoration: "underline", marginLeft: "5px" }}>Leer más</a>
        </CookieConsent>
      
      </AuthProvider>
  );
}
export default App;