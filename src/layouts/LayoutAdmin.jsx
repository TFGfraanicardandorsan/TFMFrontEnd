import Footer from "../components/footer";
import NavbarAdmin from "../components/NavbarAdmin";
import { Outlet } from "react-router-dom";

export default function LayoutAdmin() {
    return (
    <>
        <NavbarAdmin />
        <main>
            <Outlet />
        </main>
        <Footer />
    </>
    );
}