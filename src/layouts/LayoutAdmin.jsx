import Footer from "../components/comun/footer";
import NavbarAdmin from "../components/administrador/NavbarAdmin";
import { Outlet } from "react-router-dom";

export default function LayoutAdmin() {
    return (
        <div className="app-frame">
            <NavbarAdmin />
            <main id="workspace-content" tabIndex={-1} className="workspace-main">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}