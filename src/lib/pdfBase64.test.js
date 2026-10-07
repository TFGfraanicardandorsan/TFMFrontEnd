import { describe, expect, it } from "vitest";

import { pdfBase64ToFile, pdfBytesToBase64 } from "./pdfBase64.js";

describe("conversión de PDF para AutoFirma", () => {
  it("convierte los bytes a base64 y recupera un fichero PDF", async () => {
    const original = new TextEncoder().encode("%PDF-1.7\ncontenido");

    const file = pdfBase64ToFile(pdfBytesToBase64(original), "firmado.pdf");

    expect(file.name).toBe("firmado.pdf");
    expect(file.type).toBe("application/pdf");
    expect(new Uint8Array(await file.arrayBuffer())).toEqual(original);
  });

  it("rechaza una respuesta de AutoFirma que no sea un PDF", () => {
    const invalid = btoa("contenido no PDF");

    expect(() => pdfBase64ToFile(invalid)).toThrow("documento PDF válido");
  });
});
