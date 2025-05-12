import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import worker from "pdfjs-dist/build/pdf.worker.min?url";
import PropTypes from "prop-types";

pdfjsLib.GlobalWorkerOptions.workerSrc = worker;

const PermutaPdfViewer = ({ pdfUrl }) => {
  const canvasRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [scale, setScale] = useState(1.2);

  useEffect(() => {
    const fetchPdf = async () => {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const loadedPdf = await loadingTask.promise;
      setPdf(loadedPdf);
    };

    if (pdfUrl) fetchPdf();
  }, [pdfUrl]);

  useEffect(() => {
    if (pdf) {
      const renderPdf = async () => {
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;
      };

      renderPdf();
    }
  }, [pdf, scale]);

  return (
    <div className="pdf-container">
      <div className="zoom-controls">
        <button onClick={() => setScale((prev) => prev + 0.1)}>+</button>
        <button onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}>−</button>
      </div>
      <canvas ref={canvasRef} style={{ display: "block", margin: "0 auto" }} />
    </div>
  );
};

PermutaPdfViewer.propTypes = {
  pdfUrl: PropTypes.string.isRequired,
};

export default PermutaPdfViewer;
