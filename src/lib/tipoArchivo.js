const TIPOS_ADMITIDOS = new Set(["application/pdf", "image/png"]);

const empiezaPor = (bytes, firma) =>
  firma.every((byte, indice) => bytes[indice] === byte);

export const detectarTipoArchivo = (arrayBuffer, contentType, nombreArchivo = "") => {
  const bytes = new Uint8Array(arrayBuffer);

  if (empiezaPor(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }

  if (empiezaPor(bytes, [0x25, 0x50, 0x44, 0x46])) {
    return "application/pdf";
  }

  const tipoRespuesta = contentType?.split(";", 1)[0].trim().toLowerCase();
  if (TIPOS_ADMITIDOS.has(tipoRespuesta)) {
    return tipoRespuesta;
  }

  return nombreArchivo.toLowerCase().endsWith(".png")
    ? "image/png"
    : "application/pdf";
};
