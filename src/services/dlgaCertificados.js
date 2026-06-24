const DEFAULT_DLGA_API_PATH = "/dlga-api";
const DEFAULT_DLGA_PUBLIC_URL = "http://127.0.0.1:8001";
const TELEGRAM_CERTIFICATES_PATH = "/api/v1/delegados/enviarCertificadosTelegram";

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

export const getDlgaApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_DLGA_API_URL?.trim();
  return trimTrailingSlash(configuredUrl || DEFAULT_DLGA_API_PATH);
};

export const getDlgaPublicUrl = () => {
  const configuredUrl =
    import.meta.env.VITE_DLGA_PUBLIC_URL?.trim() ||
    import.meta.env.VITE_DLGA_API_URL?.trim();

  return trimTrailingSlash(configuredUrl || DEFAULT_DLGA_PUBLIC_URL);
};

export const postDlgaForm = async (endpoint, formData) => {
  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  return fetch(`${getDlgaApiBaseUrl()}/${cleanEndpoint}`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
};

export const postTelegramCertificates = async (formData) => {
  const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_URL?.trim() || "");
  return fetch(`${apiBaseUrl}${TELEGRAM_CERTIFICATES_PATH}`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
};

export const downloadDlgaTemplate = async () =>
  fetch(`${getDlgaApiBaseUrl()}/plantilla.csv`, {
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
      if (payload.message) return payload.message;
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
