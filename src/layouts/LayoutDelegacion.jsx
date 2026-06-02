import Footer from "../components/comun/footer";
import NavbarDelegacion from "../components/delegacion/NavbarDelegacion";
import { Outlet } from "react-router-dom";

export default function LayoutDelegacion() {
  return (
    <>
      <NavbarDelegacion />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
