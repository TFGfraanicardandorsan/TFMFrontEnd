import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

// Configura el worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const PermutaPdfViewer = ({ pdfUrl }) => {
  const canvasRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [scale, setScale] = useState(1); 

  // Carga el PDF
  useEffect(() => {
    if (!pdfUrl) return;

    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    loadingTask.promise.then(setPdf).catch(console.error);
  }, [pdfUrl]);

  useEffect(() => {
    if (!pdf) return;

    const canvas = canvasRef.current;
    const renderPdf = async () => {
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext("2d");

      const renderContext = {
        canvasContext: context,
        viewport,
      };

      const renderTask = page.render(renderContext);
      try {
        await renderTask.promise;
      } catch (err) {
        if (err.name !== "RenderingCancelledException") {
          console.error(err);
        }
      }
    };

    renderPdf();
  }, [pdf, scale]);

  return (
    <div className="pdf-container">
      <div className="zoom-controls" style={{ marginBottom: "10px" }}>
        <button onClick={() => setScale((s) => s + 0.1)}>Zoom +</button>
        <button onClick={() => setScale((s) => Math.max(s - 0.1, 0.1))}>Zoom -</button>
      </div>
      <canvas ref={canvasRef} style={{ display: "block", margin: "0 auto" }} />
    </div>
  );
};

PermutaPdfViewer.propTypes = {
  pdfUrl: PropTypes.string.isRequired,
};

export default PermutaPdfViewer;
