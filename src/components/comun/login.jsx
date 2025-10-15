import { login } from "../../services/login";
import "../styles/login-style.css";
import Footer from "./footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";

export default function Login() {
  const handleClickLogin = async () => await login();

  return (
    <>
      <div className="app-container">
        <div className="content">
          <div className="logo-container">
            <img src="/assets/logo-etsii-color.png" alt="Logo ETSII" />
          </div>
          <div className="login-content">
            <h1 className="login-title">Inicio sesión en Permutas ETSII</h1>
            <button className="login-button" onClick={handleClickLogin}>
              <FontAwesomeIcon icon={faLock} className="lock-icon" />
              Inicia Sesión
            </button>
          </div>
          <div className="qr-section">
            <p className="qr-info-text">
              Los usuarios que todavía no estén dados de alta en el sistema
              pueden solicitarlo al bot de Telegram.
            </p>
            <img src="/assets/telegram-qr.png" alt="QR Telegram" className="qr-image" />
          </div>
        </div>
      </div>
<div style={{ height: "80px" }} />
      <Footer />
    </>
  );
}
