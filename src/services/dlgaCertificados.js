const DEFAULT_DLGA_API_PATH = "/api/v1/delegados";
const DEFAULT_DLGA_LOCAL_PUBLIC_URL = "http://127.0.0.1:8001";
const DEFAULT_DLGA_PUBLIC_API_PATH = "/dlga-api";
const ENDPOINT_PATHS = {
  generar: "generarCertificados",
  "preparar-correos": "prepararCorreos",
};

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const normalizeDelegatesApiBaseUrl = (value) => {
  const trimmedValue = value?.trim();
  if (!trimmedValue || trimTrailingSlash(trimmedValue) === DEFAULT_DLGA_PUBLIC_API_PATH) {
    return DEFAULT_DLGA_API_PATH;
  }
  return trimTrailingSlash(trimmedValue);
};

export const getDlgaApiBaseUrl = () => {
  return normalizeDelegatesApiBaseUrl(import.meta.env.VITE_DLGA_API_URL);
};

export const getDlgaPublicUrl = () => {
  const configuredUrl = import.meta.env.VITE_DLGA_PUBLIC_URL?.trim();
  if (configuredUrl) return trimTrailingSlash(configuredUrl);

  return import.meta.env.DEV ? DEFAULT_DLGA_LOCAL_PUBLIC_URL : "";
};

export const postDlgaForm = async (endpoint, formData) => {
  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  const apiEndpoint = ENDPOINT_PATHS[cleanEndpoint] || cleanEndpoint;
  return fetch(`${getDlgaApiBaseUrl()}/${apiEndpoint}`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
};

export const postDlgaJson = async (endpoint, payload) => {
  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  const apiEndpoint = ENDPOINT_PATHS[cleanEndpoint] || cleanEndpoint;
  return fetch(`${getDlgaApiBaseUrl()}/${apiEndpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
};

export const getDlgaEndpointUrl = (endpoint) => {
  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  const apiEndpoint = ENDPOINT_PATHS[cleanEndpoint] || cleanEndpoint;
  return `${getDlgaApiBaseUrl()}/${apiEndpoint}`;
};

export const downloadDlgaTemplate = async () =>
  fetch(`${getDlgaApiBaseUrl()}/plantillaCSV`, {
    method: "GET",
    credentials: "include",
  });

export const getFilenameFromResponse = (response, fallback) => {
  const disposition = response.headers.get("content-disposition") || "";
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].replace(/"/g, ""));
  }

  const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);
  if (filenameMatch?.[1]) {
    return filenameMatch[1];
  }

  return fallback;
};

export const extractDlgaError = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (contentType.includes("application/json")) {
    try {
      const payload = JSON.parse(text);
      if (Array.isArray(payload.errors)) return payload.errors.join(" ");
      if (Array.isArray(payload.errores)) return payload.errores.join(" ");
      if (payload.message) return payload.message;
      if (payload.errmsg) return payload.errmsg;
      if (payload.error) return payload.error;
    } catch {
      return text;
    }
  }

  const cleanText = text
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleanText || `DLGA ha respondido con estado ${response.status}.`;
};
