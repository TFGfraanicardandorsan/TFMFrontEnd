import { useState } from "react";
import Papa from "papaparse";

export default function DelegadosPdfGenerator() {
  const [csvFile, setCsvFile] = useState(null);
  const [nombreAcreditador, setNombreAcreditador] = useState("");
  const [dniAcreditador, setDniAcreditador] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCsvChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile || !nombreAcreditador || !dniAcreditador) {
      alert("Rellena todos los campos y selecciona un archivo CSV.");
      return;
    }
    setLoading(true);

    Papa.parse(csvFile, {
      header: true,
      complete: async (results) => {
        try {
          const delegados = results.data.filter(row => row["nombre completo"] && row["dni"]);
          const body = {
            acreditador: {
              nombre: nombreAcreditador,
              dni: dniAcreditador,
            },
            delegados,
          };

          const response = await fetch("/api/v1/gestionDelegados/generarAcreditacionesDelegados/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!response.ok) throw new Error("Error generando PDFs");

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "acreditaciones_delegados.zip";
          document.body.appendChild(a);
          a.click();
          a.remove();
        } catch (err) {
          alert("Error generando o descargando el archivo.");
        } finally {
          setLoading(false);
        }
      },
      error: () => {
        alert("Error leyendo el CSV.");
        setLoading(false);
      }
    });
  };

  return (
    <div className="container">
      <h2>Generar certificados de delegados</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre del delegado de centro:</label>
          <input value={nombreAcreditador} onChange={e => setNombreAcreditador(e.target.value)} required />
        </div>
        <div>
          <label>DNI del delegado de centro:</label>
          <input value={dniAcreditador} onChange={e => setDniAcreditador(e.target.value)} required />
        </div>
        <div>
          <label>CSV de delegados de grupo:</label>
          <input type="file" accept=".csv" onChange={handleCsvChange} required />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Generando..." : "Generar y descargar ZIP"}
        </button>
      </form>
    </div>
  );
}