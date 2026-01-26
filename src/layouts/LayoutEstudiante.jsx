import Footer from "../components/comun/footer";
import NavbarEstudiante from "../components/usuario/NavbarEstudiante";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { comprobarAsignaturasSinGrupo } from "../services/asignaturas";

export default function LayoutEstudiante() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const verificarAsignaturas = async () => {
            const ignorePaths = ["/seleccionarGrupos", "/seleccionarAsignaturas", "/login", "/noRegistrado"];

            if (ignorePaths.includes(location.pathname)) {
                return;
            }

            try {
                const res = await comprobarAsignaturasSinGrupo();
                console.log("[LayoutEstudiante] Comprobando asignaturas sin grupo...");
                console.log("[LayoutEstudiante] Ruta actual:", location.pathname);
                console.log("[LayoutEstudiante] Respuesta completa API:", JSON.stringify(res));

                // Comprobamos si hay asignaturas sin grupo (el API puede devolver {result: true} o directamente true)
                // Usamos una comprobación flexible por si el backend devuelve la estructura anidada
                const hasUnassignedSubjects = res.result === true || res.result?.result === true;

                if (!res.err && hasUnassignedSubjects) {
                    console.log("[LayoutEstudiante] ¡Se detectaron asignaturas sin grupo! Redirigiendo...");
                    navigate("/seleccionarGrupos");
                } else {
                    console.log("[LayoutEstudiante] Todo correcto o error en la respuesta.");
                }
            } catch (error) {
                console.error("[LayoutEstudiante] Error en el proceso de verificación:", error);
            }
        };

        verificarAsignaturas();
    }, [location.pathname, navigate]);


    return (
        <>
            <NavbarEstudiante />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    );
}