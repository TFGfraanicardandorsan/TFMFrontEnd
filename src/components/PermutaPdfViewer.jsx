import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import PropTypes from 'prop-types';

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

        page.render(renderContext);
      };

      renderPdf();
    }
  }, [pdf, scale]);

  return (
    <div className="pdf-container">
      <div className="zoom-controls">
        <button onClick={() => setScale(scale + 0.1)}>Zoom In</button>
        <button onClick={() => setScale(scale - 0.1)}>Zoom Out</button>
      </div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};
PermutaPdfViewer.propTypes = {
  pdfUrl: PropTypes.string.isRequired,
};

export default PermutaPdfViewer;
