import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearCsrfToken,
  csrfFetch,
  getCsrfToken,
} from "./csrf.js";

const response = ({ status = 200, payload = {}, csrfError = false } = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: new Headers(csrfError ? { "X-CSRF-Error": "1" } : {}),
  json: vi.fn().mockResolvedValue(payload),
});

describe("protección CSRF del cliente", () => {
  beforeEach(() => {
    clearCsrfToken();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearCsrfToken();
  });

  it("obtiene y reutiliza un token de sesión", async () => {
    fetch.mockResolvedValueOnce(response({ payload: { csrfToken: "token-1" } }));

    await expect(getCsrfToken()).resolves.toBe("token-1");
    await expect(getCsrfToken()).resolves.toBe("token-1");

    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0][0]).toBe("/api/v1/csrf-token");
  });

  it("adjunta X-CSRF-Token en las peticiones POST", async () => {
    fetch
      .mockResolvedValueOnce(response({ payload: { csrfToken: "token-1" } }))
      .mockResolvedValueOnce(response());

    await csrfFetch("/api/v1/grupo/crearGrupoAsignatura", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });

    const requestOptions = fetch.mock.calls[1][1];
    expect(requestOptions.credentials).toBe("include");
    expect(requestOptions.headers.get("X-CSRF-Token")).toBe("token-1");
    expect(requestOptions.headers.get("Content-Type")).toBe("application/json");
  });

  it("renueva el token una vez cuando el servidor indica error CSRF", async () => {
    fetch
      .mockResolvedValueOnce(response({ payload: { csrfToken: "token-antiguo" } }))
      .mockResolvedValueOnce(response({ status: 403, csrfError: true }))
      .mockResolvedValueOnce(response({ payload: { csrfToken: "token-nuevo" } }))
      .mockResolvedValueOnce(response());

    const result = await csrfFetch("/api/v1/incidencia/crearIncidencia", {
      method: "POST",
    });

    expect(result.ok).toBe(true);
    expect(fetch.mock.calls[3][1].headers.get("X-CSRF-Token")).toBe("token-nuevo");
  });

  it("no solicita token para métodos seguros", async () => {
    fetch.mockResolvedValueOnce(response());

    await csrfFetch("/api/v1/autorizacion/obtenerSesion", { method: "GET" });

    expect(fetch).toHaveBeenCalledOnce();
  });
});
