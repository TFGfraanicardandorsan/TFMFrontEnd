const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const CSRF_HEADER_NAME = "X-CSRF-Token";

let csrfToken;
let csrfTokenPromise;

const apiBaseUrl = () =>
  String(import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export const clearCsrfToken = () => {
  csrfToken = undefined;
  csrfTokenPromise = undefined;
};

export const getCsrfToken = async ({ forceRefresh = false } = {}) => {
  if (forceRefresh) clearCsrfToken();
  if (csrfToken) return csrfToken;
  if (csrfTokenPromise) return csrfTokenPromise;

  csrfTokenPromise = fetch(`${apiBaseUrl()}/api/v1/csrf-token`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`No se pudo obtener el token CSRF (${response.status}).`);
      }
      const payload = await response.json();
      if (typeof payload.csrfToken !== "string" || !payload.csrfToken) {
        throw new Error("El servidor no devolvió un token CSRF válido.");
      }
      csrfToken = payload.csrfToken;
      return csrfToken;
    })
    .finally(() => {
      csrfTokenPromise = undefined;
    });

  return csrfTokenPromise;
};

export const csrfFetch = async (input, init = {}) => {
  const method = String(init.method || "GET").toUpperCase();
  if (SAFE_METHODS.has(method)) {
    return fetch(input, init);
  }

  let token = await getCsrfToken();
  let response = await fetchWithToken(input, init, token);

  if (response.status === 403 && response.headers.get("X-CSRF-Error") === "1") {
    token = await getCsrfToken({ forceRefresh: true });
    response = await fetchWithToken(input, init, token);
  }

  return response;
};

const fetchWithToken = (input, init, token) => {
  const headers = new Headers(init.headers || {});
  headers.set(CSRF_HEADER_NAME, token);
  return fetch(input, {
    ...init,
    credentials: init.credentials || "include",
    headers,
  });
};
