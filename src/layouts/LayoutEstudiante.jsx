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
            // No redirigir si ya estamos en la página de selección de grupos o asignaturas
            const ignorePaths = ["/seleccionarGrupos", "/seleccionarAsignaturas", "/login", "/noRegistrado"];
            if (ignorePaths.includes(location.pathname)) {
                return;
            }

            try {
                const res = await comprobarAsignaturasSinGrupo();
                // Si el API devuelve true (como booleano dentro de result)
                if (!res.err && res.result?.result === true) {
                    navigate("/seleccionarGrupos");
                }
            } catch (error) {
                console.error("Error al comprobar asignaturas sin grupo:", error);
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