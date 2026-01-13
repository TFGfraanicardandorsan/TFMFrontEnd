import Footer from "../components/comun/footer";
import NavbarEstudiante from "../components/NavbarEstudiante";
import { Outlet } from "react-router-dom";

export default function LayoutEstudiante() {
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