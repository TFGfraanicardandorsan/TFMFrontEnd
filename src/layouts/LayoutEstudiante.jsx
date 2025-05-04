import NavbarEstudiante from "../components/NavbarEstudiante";
import Footer from "../components/Footer";
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