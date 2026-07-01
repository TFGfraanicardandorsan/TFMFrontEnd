import Footer from "../components/comun/footer";
import NavbarAdmin from "../components/administrador/NavbarAdmin";
import NavbarDelegacion from "../components/delegacion/NavbarDelegacion";
import { Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ADMIN_ROLE, isAllowedRole } from "../lib/roles";

export default function LayoutDelegacion() {
  const { user } = useAuth();
  const isAdmin = isAllowedRole(user?.rol, [ADMIN_ROLE]);

  return (
    <>
      {isAdmin ? <NavbarAdmin /> : <NavbarDelegacion />}
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
