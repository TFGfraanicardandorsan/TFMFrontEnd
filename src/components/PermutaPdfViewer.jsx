import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import worker from "pdfjs-dist/build/pdf.worker.min?url";
import PropTypes from "prop-types";

pdfjsLib.GlobalWorkerOptions.workerSrc = worker;
pdfjsLib.GlobalWorkerOptions.standardFontDataUrl = '/pdfjs-dist/standard_fonts/';

const PermutaPdfViewer = ({ pdfUrl }) => {
  const canvasRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [scale, setScale] = useState(1);

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
    let renderTask = null;

    const renderPdf = async () => {
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport,
      };

      if (renderTask) {
        renderTask.cancel();
      }

      renderTask = page.render(renderContext);
      await renderTask.promise;
    };

    renderPdf();

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }
}, [pdf, scale]);


  return (
    <div className="pdf-container">
      <canvas ref={canvasRef} style={{ display: "block", margin: "0 auto" }} />
    </div>
  );
};

PermutaPdfViewer.propTypes = {
  pdfUrl: PropTypes.string.isRequired,
};

export default PermutaPdfViewer;
