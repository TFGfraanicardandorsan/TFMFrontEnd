import { describe, expect, it, vi } from "vitest";

import { signPdfDocuments } from "./autofirma.js";

describe("signPdfDocuments", () => {
  it("firma los PDFs en orden reutilizando el mismo certificado", async () => {
    const autoScript = {
      cargarAppAfirma: vi.fn(),
      setStickySignatory: vi.fn(),
      sign: vi.fn((data, algorithm, format, params, onSuccess) => {
        onSuccess(`firmado-${data}`);
      }),
    };
    const documents = [
      { filename: "uno.pdf", pdfBase64: "pdf-uno" },
      { filename: "dos.pdf", pdfBase64: "pdf-dos" },
    ];

    const result = await signPdfDocuments(documents, autoScript);

    expect(result.map((document) => document.pdfBase64)).toEqual([
      "firmado-pdf-uno",
      "firmado-pdf-dos",
    ]);
    expect(autoScript.cargarAppAfirma).toHaveBeenCalledOnce();
    expect(autoScript.setStickySignatory.mock.calls).toEqual([[true], [false]]);
    expect(autoScript.sign).toHaveBeenNthCalledWith(
      1,
      "pdf-uno",
      "SHA256withRSA",
      "PAdES",
      expect.stringContaining("layer2Text=Firmado electrónicamente por:"),
      expect.any(Function),
      expect.any(Function),
    );
    expect(autoScript.sign.mock.calls[0][3]).toContain("signaturePage=1");
    expect(autoScript.sign.mock.calls[0][3]).toContain(
      "signaturePositionOnPageLowerLeftX=145",
    );
    expect(autoScript.sign.mock.calls[0][3]).toContain(
      "$$SIGNDATE=dd/MM/yyyy HH:mm:ss$$",
    );
  });

  it("propaga el error de AutoFirma y libera el certificado fijado", async () => {
    const autoScript = {
      cargarAppAfirma: vi.fn(),
      setStickySignatory: vi.fn(),
      sign: vi.fn((data, algorithm, format, params, onSuccess, onError) => {
        onError("es.gob.afirma.Error", "Firma cancelada");
      }),
    };

    await expect(
      signPdfDocuments([{ filename: "uno.pdf", pdfBase64: "pdf-uno" }], autoScript),
    ).rejects.toThrow("Firma cancelada");
    expect(autoScript.setStickySignatory.mock.calls).toEqual([[true], [false]]);
  });
});
