import { useState } from "react";
import Papa from "papaparse";
import { useTranslation } from "react-i18next";
import { csrfFetch } from "../lib/csrf.js";

export default function DelegadosPdfGenerator() {
  const { t } = useTranslation();
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
      alert(t("delegation_legacy.fill_all"));
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

          const response = await csrfFetch("/api/v1/gestionDelegados/generarAcreditacionesDelegados/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!response.ok) throw new Error(t("delegation_legacy.generation_error"));

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "acreditaciones_delegados.zip";
          document.body.appendChild(a);
          a.click();
          a.remove();
        } catch {
          alert(t("delegation_legacy.download_error"));
        } finally {
          setLoading(false);
        }
      },
      error: () => {
        alert(t("delegation_legacy.csv_error"));
        setLoading(false);
      }
    });
  };

  return (
    <div className="container">
      <h2>{t("delegation_legacy.title")}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>{t("delegation_legacy.center_delegate_name")}</label>
          <input value={nombreAcreditador} onChange={e => setNombreAcreditador(e.target.value)} required />
        </div>
        <div>
          <label>{t("delegation_legacy.center_delegate_dni")}</label>
          <input value={dniAcreditador} onChange={e => setDniAcreditador(e.target.value)} required />
        </div>
        <div>
          <label>{t("delegation_legacy.group_delegates_csv")}</label>
          <input type="file" accept=".csv" onChange={handleCsvChange} required />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? t("delegation_legacy.generating") : t("delegation_legacy.generate_zip")}
        </button>
      </form>
    </div>
  );
}
