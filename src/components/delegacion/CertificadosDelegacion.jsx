import { useMemo, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  downloadDlgaTemplate,
  extractDlgaError,
  getDlgaPublicUrl,
  getFilenameFromResponse,
  postDlgaForm,
} from "../../services/dlgaCertificados.js";
import "../../styles/delegacion-certificados-style.css";

const DEFAULT_SENDER = "delegacion_etsii@us.es";
const DEFAULT_SMTP_HOST = "smtp.office365.com";
const DEFAULT_SMTP_PORT = "587";

const fallbackNames = {
  generar: "certificados_delegados.zip",
  "preparar-correos": "correos_certificados.zip",
  plantilla: "plantilla_certificados.csv",
};

export default function CertificadosDelegacion() {
  const { t } = useTranslation();
  const formRef = useRef(null);
  const [archivo, setArchivo] = useState(null);
  const [firmante, setFirmante] = useState("");
  const [fechaSolicitud, setFechaSolicitud] = useState(() => new Date().toISOString().slice(0, 10));
  const [enviarEmail, setEnviarEmail] = useState(false);
  const [remitenteEmail, setRemitenteEmail] = useState(DEFAULT_SENDER);
  const [passwordEmail, setPasswordEmail] = useState("");
  const [loadingAction, setLoadingAction] = useState("");

  const dlgaPublicUrl = useMemo(() => getDlgaPublicUrl(), []);
  const isLoading = Boolean(loadingAction);

  const validateForm = () => {
    if (!archivo) {
      toast.warning(t("delegation.certificates.errors.select_csv"));
      return false;
    }
    if (!firmante.trim()) {
      toast.warning(t("delegation.certificates.errors.signer_required"));
      return false;
    }
    return true;
  };

  const buildFormData = () => new FormData(formRef.current);

  const downloadResponse = async (response, fallbackName) => {
    const blob = await response.blob();
    const filename = getFilenameFromResponse(response, fallbackName);
    saveAs(blob, filename);
  };

  const handleDownloadAction = async (endpoint) => {
    if (!validateForm()) return;

    setLoadingAction(endpoint);
    try {
      const response = await postDlgaForm(endpoint, buildFormData());
      if (!response.ok) {
        throw new Error(await extractDlgaError(response));
      }

      await downloadResponse(response, fallbackNames[endpoint]);
      toast.success(t("delegation.certificates.messages.download_ready"));
    } catch (error) {
      toast.error(error.message || t("delegation.certificates.errors.operation_failed"));
    } finally {
      setLoadingAction("");
    }
  };

  const handleTemplateDownload = async () => {
    setLoadingAction("plantilla");
    try {
      const response = await downloadDlgaTemplate();
      if (!response.ok) {
        throw new Error(await extractDlgaError(response));
      }
      await downloadResponse(response, fallbackNames.plantilla);
    } catch (error) {
      toast.error(error.message || t("delegation.certificates.errors.template_failed"));
    } finally {
      setLoadingAction("");
    }
  };

  const submitExternalAction = (endpoint, extraValues = {}) => {
    if (!validateForm()) return;

    const form = formRef.current;
    const previous = {
      action: form.action,
      target: form.target,
      method: form.method,
      enctype: form.enctype,
    };

    const hiddenInputs = Object.entries(extraValues).map(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
      return input;
    });

    form.action = `${dlgaPublicUrl}/${endpoint}`;
    form.target = "_blank";
    form.method = "post";
    form.enctype = "multipart/form-data";
    form.submit();

    window.setTimeout(() => {
      hiddenInputs.forEach((input) => input.remove());
      form.action = previous.action;
      form.target = previous.target;
      form.method = previous.method;
      form.enctype = previous.enctype;
    }, 0);
  };

  const openMicrosoftLogin = () => {
    window.open(`${dlgaPublicUrl}/auth/microsoft/login`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="delegacion-page">
      <div className="delegacion-content">
        <header className="delegacion-header">
          <div className="delegacion-brand-row">
            <img src="/assets/dlga/dlga.png" alt="DLGA" className="delegacion-logo" />
            <img
              src="/assets/logo-etsii-color.png"
              alt={t("footer.school_name")}
              className="delegacion-etsii-logo"
            />
          </div>
          <div>
            <p className="delegacion-kicker">{t("delegation.certificates.kicker")}</p>
            <h1>{t("delegation.certificates.title")}</h1>
          </div>
        </header>

        <form ref={formRef} className="delegacion-form" onSubmit={(event) => event.preventDefault()}>
          <input type="hidden" name="smtp_host" value={DEFAULT_SMTP_HOST} />
          <input type="hidden" name="smtp_port" value={DEFAULT_SMTP_PORT} />

          <section className="delegacion-section">
            <div className="delegacion-section-header">
              <h2>{t("delegation.certificates.sections.batch")}</h2>
              <button
                type="button"
                className="delegacion-button delegacion-button-secondary"
                onClick={handleTemplateDownload}
                disabled={isLoading}
              >
                {t("delegation.certificates.buttons.csv_template")}
              </button>
            </div>

            <div className="delegacion-grid">
              <label className="delegacion-field delegacion-field-wide">
                <span>CSV</span>
                <input
                  name="archivo"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(event) => setArchivo(event.target.files?.[0] || null)}
                  required
                />
              </label>

              <label className="delegacion-field">
                <span>{t("delegation.certificates.fields.signer")}</span>
                <input
                  name="firmante"
                  type="text"
                  value={firmante}
                  onChange={(event) => setFirmante(event.target.value)}
                  placeholder={t("delegation.certificates.placeholders.signer")}
                  required
                />
              </label>

              <label className="delegacion-field">
                <span>{t("delegation.certificates.fields.request_date")}</span>
                <input
                  name="fecha_solicitud"
                  type="date"
                  value={fechaSolicitud}
                  onChange={(event) => setFechaSolicitud(event.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="delegacion-section delegacion-email-section">
            <div className="delegacion-section-header">
              <h2>{t("delegation.certificates.sections.email")}</h2>
              <label className="delegacion-checkline">
                <input
                  name="enviar_email"
                  type="checkbox"
                  value="1"
                  checked={enviarEmail}
                  onChange={(event) => setEnviarEmail(event.target.checked)}
                />
                {t("delegation.certificates.fields.send_on_generate")}
              </label>
            </div>

            <div className="delegacion-grid">
              <label className="delegacion-field">
                <span>{t("delegation.certificates.fields.sender")}</span>
                <input
                  name="remitente_email"
                  type="email"
                  value={remitenteEmail}
                  onChange={(event) => setRemitenteEmail(event.target.value)}
                />
              </label>

              <label className="delegacion-field">
                <span>{t("delegation.certificates.fields.smtp_password")}</span>
                <input
                  name="password_email"
                  type="password"
                  value={passwordEmail}
                  onChange={(event) => setPasswordEmail(event.target.value)}
                  autoComplete="current-password"
                />
              </label>
            </div>
          </section>

          <section className="delegacion-actions" aria-label={t("delegation.certificates.actions_label")}>
            <button
              type="button"
              className="delegacion-button delegacion-button-secondary"
              onClick={() => handleDownloadAction("preparar-correos")}
              disabled={isLoading}
            >
              {t("delegation.certificates.buttons.outlook_emails")}
            </button>
            <button
              type="button"
              className="delegacion-button delegacion-button-primary"
              onClick={() => handleDownloadAction("generar")}
              disabled={isLoading}
            >
              {loadingAction === "generar"
                ? t("delegation.certificates.buttons.generating")
                : t("delegation.certificates.buttons.generate_pdfs")}
            </button>
            <button
              type="button"
              className="delegacion-button delegacion-button-primary"
              onClick={() => submitExternalAction("firmar-lote")}
              disabled={isLoading}
            >
              {t("delegation.certificates.buttons.sign_batch")}
            </button>
          </section>

          <section className="delegacion-section delegacion-graph-section">
            <div>
              <h2>{t("delegation.certificates.sections.graph")}</h2>
              <p>{dlgaPublicUrl}</p>
            </div>
            <div className="delegacion-graph-actions">
              <button
                type="button"
                className="delegacion-button delegacion-button-secondary"
                onClick={openMicrosoftLogin}
                disabled={isLoading}
              >
                {t("delegation.certificates.buttons.connect_microsoft")}
              </button>
              <button
                type="button"
                className="delegacion-button delegacion-button-secondary"
                onClick={() => submitExternalAction("enviar-graph")}
                disabled={isLoading}
              >
                {t("delegation.certificates.buttons.send_graph")}
              </button>
              <button
                type="button"
                className="delegacion-button delegacion-button-primary"
                onClick={() => submitExternalAction("firmar-lote", { email_transport: "graph" })}
                disabled={isLoading}
              >
                {t("delegation.certificates.buttons.sign_and_send_graph")}
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}
