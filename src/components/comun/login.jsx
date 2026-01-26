import { login } from "../../services/login";
import "../../styles/login-style.css";
import Footer from "./footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";


export default function Login() {
  const { t } = useTranslation();
  const handleClickLogin = async () => await login();


  return (
    <>
      <div className="app-container">
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <LanguageSwitcher />
        </div>
        <div className="content">

          <div className="logo-container">
            <img src="/assets/logo-etsii-color.png" alt="Logo ETSII" />
          </div>
          <div className="login-content">
            <h1 className="login-title">{t("login.title")}</h1>

            <button className="login-button" onClick={handleClickLogin}>
              <FontAwesomeIcon icon={faLock} className="lock-icon" />
              {t("login.button")}
            </button>

          </div>
          <div className="qr-section">
            <p className="qr-info-text">
              {t("login.telegram_info")}
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
