import Footer from "./footer";
import "../styles/login-style.css"; // Puedes reutilizar estilos de login o crear unos nuevos

export default function RegistroTelegram() {
  return (
    <>
      <div className="app-container">
        <div className="content" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="logo-container">
            <img src="/assets/logo-etsii-color.png" alt="Logo ETSII" />
          </div>
          <div className="login-content" style={{ textAlign: "center" }}>
            <h1 className="login-title">Registro en Permutas ETSII</h1>
            <p style={{ margin: "20px 0" }}>
              Para registrarte en la plataforma, escanea el siguiente código QR y sigue las instrucciones del bot de Telegram.
            </p>
            <img
              src="/assets/telegram-qr.png"
              alt="QR Telegram"
              className="qr-image"
              style={{ maxWidth: 240, width: "100%", margin: "0 auto", display: "block" }}
            />
            <p style={{ marginTop: 16, fontWeight: "bold", color: "#34a2e2" }}>
              @PERMUTASETSII_BOT
            </p>
          </div>
        </div>
      </div>
      <div style={{ height: "80px" }} />
      <Footer />
    </>
  );
}