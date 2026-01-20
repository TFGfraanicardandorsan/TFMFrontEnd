import { useState, useEffect } from "react";

export default function VolverArriba() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      className="volver-arriba-btn"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1000,
        padding: "10px 16px",
        borderRadius: "50%",
        background: "#007bff",
        color: "#fff",
        border: "none",
        fontSize: "1.5em",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        cursor: "pointer"
      }}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Volver arriba"
    >
      ↑
    </button>
  );
}