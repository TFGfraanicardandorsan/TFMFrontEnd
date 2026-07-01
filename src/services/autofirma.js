const AUTOSCRIPT_COMMIT = "fe60ef3fdbae3c491e97c262a2179e2787b85776";
const DEFAULT_AUTOSCRIPT_URL =
  `https://cdn.jsdelivr.net/gh/ctt-gob-es/clienteafirma@${AUTOSCRIPT_COMMIT}` +
  "/afirma-ui-miniapplet-deploy/src/main/webapp/js/autoscript.js";
const DEFAULT_AUTOSCRIPT_INTEGRITY =
  "sha384-8YmT/kkrE2QNyDdGbKhyxvI8IV40ItyPrxZ4tpDpD/Vrav7lCm7n5dq72iVRuhwq";
const VISIBLE_SIGNATURE_PARAMS = [
  "signaturePage=1",
  "signaturePositionOnPageLowerLeftX=145",
  "signaturePositionOnPageLowerLeftY=70",
  "signaturePositionOnPageUpperRightX=450",
  "signaturePositionOnPageUpperRightY=145",
  "layer2Text=Firmado electrónicamente por:\\n$$SUBJECTCN$$\\nFecha: $$SIGNDATE=dd/MM/yyyy HH:mm:ss$$",
  "layer2FontFamily=1",
  "layer2FontSize=9",
  "layer2FontStyle=0",
  "layer2FontColor=darkGray",
  "signReason=Certificación de delegado",
].join("\n");

let autoScriptPromise;

export const loadAutoFirma = () => {
  if (window.AutoScript) return Promise.resolve(window.AutoScript);
  if (autoScriptPromise) return autoScriptPromise;

  autoScriptPromise = new Promise((resolve, reject) => {
    const configuredUrl = import.meta.env.VITE_AUTOFIRMA_SCRIPT_URL?.trim();
    const script = document.createElement("script");
    script.src = configuredUrl || DEFAULT_AUTOSCRIPT_URL;
    script.async = true;
    script.crossOrigin = "anonymous";
    if (!configuredUrl) script.integrity = DEFAULT_AUTOSCRIPT_INTEGRITY;

    script.addEventListener("load", () => {
      if (window.AutoScript) {
        resolve(window.AutoScript);
      } else {
        reject(new Error("AutoFirma se ha cargado sin exponer AutoScript."));
      }
    });
    script.addEventListener("error", () => {
      autoScriptPromise = undefined;
      reject(new Error("No se pudo cargar el componente web de AutoFirma."));
    });
    document.head.appendChild(script);
  });

  return autoScriptPromise;
};

export async function signPdfDocuments(documents, autoScript = null) {
  if (!Array.isArray(documents) || documents.length === 0) {
    throw new Error("No hay certificados para firmar.");
  }

  const client = autoScript || await loadAutoFirma();
  client.cargarAppAfirma();
  client.setStickySignatory(true);

  try {
    const signedDocuments = [];
    for (const document of documents) {
      const pdfBase64 = String(document.pdfBase64 || "").trim();
      if (!pdfBase64) {
        throw new Error(`El certificado ${document.filename || ""} no contiene un PDF.`);
      }

      const signedPdfBase64 = await signPdf(client, pdfBase64);
      signedDocuments.push({
        ...document,
        pdfBase64: signedPdfBase64,
      });
    }
    return signedDocuments;
  } finally {
    client.setStickySignatory(false);
  }
}

function signPdf(client, pdfBase64) {
  return new Promise((resolve, reject) => {
    client.sign(
      pdfBase64,
      "SHA256withRSA",
      "PAdES",
      VISIBLE_SIGNATURE_PARAMS,
      (signedPdfBase64) => resolve(signedPdfBase64),
      (errorType, errorMessage) => {
        reject(new Error(errorMessage || errorType || "AutoFirma no pudo firmar el certificado."));
      },
    );
  });
}
