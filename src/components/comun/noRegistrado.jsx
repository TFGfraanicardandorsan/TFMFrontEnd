import Footer from "./footer";
import "../../styles/login-style.css"; // Puedes reutilizar estilos de login o crear unos nuevos
import { useTranslation } from "react-i18next";

export default function RegistroTelegram() {
  const { t } = useTranslation();

  return (
    <>
      <div className="app-container">
        <div className="content" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="logo-container">
            <img src="/assets/logo-etsii-color.png" alt={t("common.logo_alt")} />
          </div>
          <div className="login-content" style={{ textAlign: "center" }}>
            <h1 className="login-title">{t("registration.title")}</h1>
            <p style={{ fontWeight: "bold", fontSize: 20 }}>{t("registration.not_found")}</p>
            <p style={{ margin: "20px 0", fontWeight: "bold" }}>
              {t("registration.instructions")}
            </p>
            <img
              src="/assets/telegram-qr.png"
              alt={t("registration.telegram_alt")}
              className="qr-image"
              style={{ maxWidth: 240, width: "100%", margin: "0 auto", display: "block" }}
            />
            <p style={{ marginTop: 16, fontWeight: "bold", color: "#34a2e2" }}>
              @PERMUTASETSII_BOT
            </p>
          </div>
          <div clsassName="boton-volver" style={{ marginTop: 20 }}>
            <a href="/login" className="login-button" style={{ textDecoration: "none", padding: "10px 20px", backgroundColor: "#6099c4", color: "#fff", borderRadius: 4 }}>
              {t("registration.back_login")}
            </a>
          </div>
          <div style={{ flex: 1 }}>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
