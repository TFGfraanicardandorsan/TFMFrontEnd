const AUTOSCRIPT_COMMIT = "fe60ef3fdbae3c491e97c262a2179e2787b85776";
const DEFAULT_AUTOSCRIPT_URL =
  `https://cdn.jsdelivr.net/gh/ctt-gob-es/clienteafirma@${AUTOSCRIPT_COMMIT}` +
  "/afirma-ui-miniapplet-deploy/src/main/webapp/js/autoscript.js";
const DEFAULT_AUTOSCRIPT_INTEGRITY =
  "sha384-8YmT/kkrE2QNyDdGbKhyxvI8IV40ItyPrxZ4tpDpD/Vrav7lCm7n5dq72iVRuhwq";
const buildVisibleSignatureParams = ({
  lowerLeftX,
  lowerLeftY,
  upperRightX,
  upperRightY,
  reason,
}) => [
  "signaturePage=1",
  `signaturePositionOnPageLowerLeftX=${lowerLeftX}`,
  `signaturePositionOnPageLowerLeftY=${lowerLeftY}`,
  `signaturePositionOnPageUpperRightX=${upperRightX}`,
  `signaturePositionOnPageUpperRightY=${upperRightY}`,
  "layer2Text=Firmado electrónicamente por:\\n$$SUBJECTCN$$\\nFecha: $$SIGNDATE=dd/MM/yyyy HH:mm:ss$$",
  "layer2FontFamily=1",
  "layer2FontSize=9",
  "layer2FontStyle=0",
  "layer2FontColor=darkGray",
  `signReason=${reason}`,
].join("\n");

const VISIBLE_SIGNATURE_PARAMS = buildVisibleSignatureParams({
  lowerLeftX: 145,
  lowerLeftY: 70,
  upperRightX: 450,
  upperRightY: 145,
  reason: "Certificación de delegado",
});

const PERMUTA_SIGNATURE_PARAMS = Object.freeze({
  1: buildVisibleSignatureParams({
    lowerLeftX: 50,
    lowerLeftY: 45,
    upperRightX: 275,
    upperRightY: 120,
    reason: "Solicitud de permuta - solicitante 1",
  }),
  2: buildVisibleSignatureParams({
    lowerLeftX: 320,
    lowerLeftY: 45,
    upperRightX: 545,
    upperRightY: 120,
    reason: "Solicitud de permuta - solicitante 2",
  }),
});

export const getPermutaSignatureParams = (signerNumber) => {
  const params = PERMUTA_SIGNATURE_PARAMS[signerNumber];
  if (!params) throw new Error("El firmante de la solicitud de permuta no es válido.");
  return params;
};

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

export async function signPdfDocuments(documents, autoScript = null, options = {}) {
  if (!Array.isArray(documents) || documents.length === 0) {
    throw new Error("No hay documentos para firmar.");
  }

  const client = autoScript || await loadAutoFirma();
  client.cargarAppAfirma();
  client.setStickySignatory(true);

  try {
    const signedDocuments = [];
    for (const document of documents) {
      const pdfBase64 = String(document.pdfBase64 || "").trim();
      if (!pdfBase64) {
        throw new Error(`El documento ${document.filename || ""} no contiene un PDF.`);
      }

      const signedPdfBase64 = await signPdf(
        client,
        pdfBase64,
        options.signatureParams || VISIBLE_SIGNATURE_PARAMS,
      );
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

function signPdf(client, pdfBase64, signatureParams) {
  return new Promise((resolve, reject) => {
    client.sign(
      pdfBase64,
      "SHA256withRSA",
      "PAdES",
      signatureParams,
      (signedPdfBase64) => resolve(signedPdfBase64),
      (errorType, errorMessage) => {
        reject(new Error(errorMessage || errorType || "AutoFirma no pudo firmar el documento."));
      },
    );
  });
}
