// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import AuthContext from "../../contexts/AuthContext.jsx";
import LayoutDelegacion from "../LayoutDelegacion.jsx";

vi.mock("../../components/administrador/NavbarAdmin", () => ({
  default: () => <div data-testid="navbar-admin">Navbar administrador</div>,
}));

vi.mock("../../components/delegacion/NavbarDelegacion", () => ({
  default: () => <div data-testid="navbar-delegacion">Navbar delegación</div>,
}));

vi.mock("../../components/comun/footer", () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

const renderLayout = (rol) =>
  render(
    <AuthContext.Provider
      value={{
        loading: false,
        isAuthenticated: true,
        user: { rol },
      }}
    >
      <MemoryRouter initialEntries={["/delegacion/certificados"]}>
        <Routes>
          <Route element={<LayoutDelegacion />}>
            <Route
              path="/delegacion/certificados"
              element={<div>Certificados</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );

describe("LayoutDelegacion", () => {
  afterEach(cleanup);

  it("mantiene la navbar de administrador para el rol administrador", () => {
    renderLayout("administrador");

    expect(screen.getByTestId("navbar-admin")).toBeInTheDocument();
    expect(screen.queryByTestId("navbar-delegacion")).not.toBeInTheDocument();
    expect(screen.getByText("Certificados")).toBeInTheDocument();
  });

  it("muestra la navbar de delegación para el rol delegacion", () => {
    renderLayout("delegacion");

    expect(screen.getByTestId("navbar-delegacion")).toBeInTheDocument();
    expect(screen.queryByTestId("navbar-admin")).not.toBeInTheDocument();
  });
});
