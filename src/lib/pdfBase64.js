const PDF_DATA_URL_PREFIX = /^data:application\/pdf;base64,/i;

export const pdfBytesToBase64 = (value) => {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
  const chunkSize = 0x8000;
  let binary = "";

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }

  return btoa(binary);
};

export const pdfBase64ToFile = (value, filename = "solicitud-permutas-firmada.pdf") => {
  const base64 = String(value || "")
    .replace(PDF_DATA_URL_PREFIX, "")
    .replace(/\s/g, "");
  if (!base64) throw new Error("AutoFirma no ha devuelto el PDF firmado.");

  let binary;
  try {
    binary = atob(base64);
  } catch {
    throw new Error("AutoFirma ha devuelto una firma con formato no válido.");
  }

  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  if (bytes.length < 4 || String.fromCharCode(...bytes.subarray(0, 4)) !== "%PDF") {
    throw new Error("AutoFirma no ha devuelto un documento PDF válido.");
  }

  return new File([bytes], filename, { type: "application/pdf" });
};
