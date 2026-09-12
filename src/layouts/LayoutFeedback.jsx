import { Outlet } from "react-router-dom";
import Footer from "../components/comun/footer";
import NavbarAdmin from "../components/administrador/NavbarAdmin";
import NavbarDelegacion from "../components/delegacion/NavbarDelegacion";
import NavbarEstudiante from "../components/usuario/NavbarEstudiante";
import { useAuth } from "../hooks/useAuth";
import { ADMIN_ROLE, isAllowedRole, isDelegationRole } from "../lib/roles";

export default function LayoutFeedback() {
    const { user } = useAuth();

    const navbar = isAllowedRole(user?.rol, [ADMIN_ROLE])
        ? <NavbarAdmin />
        : isDelegationRole(user?.rol)
            ? <NavbarDelegacion />
            : <NavbarEstudiante />;

    return (
        <div className="app-frame">
            {navbar}
            <main id="workspace-content" tabIndex={-1} className="workspace-main">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
