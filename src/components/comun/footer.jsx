import "../../styles/footer-style.css";
import { yearValue } from "../../lib/generadorFechas"
import { useTranslation } from "react-i18next";


export default function Footer() {
  const { t } = useTranslation();
  return (

    <>
      <div className="footer-spacer" />
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <p>
              <strong>{t("footer.students_delegation")}</strong>
              <br />
              <strong>
                {t("footer.school_name")}
              </strong>
              <br />
            </p>
          </div>

          <div className="footer-section">
            <p>
              {t("footer.university_name")}
              <br />

              Avda. Reina Mercedes s/n,
              <br />
              41012 Sevilla
              <br />
              Tlfno: 954556817 © {yearValue}
            </p>
          </div>
          <div>
            <h4>{t("footer.policies")}</h4>
            <ul>
              <li>
                <a href="/politicaPrivacidad">{t("footer.privacy_policy")}</a>
              </li>
              <li>
                <a href="/cookies">{t("footer.cookies_policy")}</a>
              </li>
            </ul>
          </div>


          <div>
            <h4>{t("footer.guides")}</h4>
            <ul>
              <li>
                <a href="https://github.com/TFGfraanicardandorsan/wiki/blob/main/Manuales%20de%20usuario.pdf">{t("footer.user_guide")}</a>
              </li>
              <li>
                <a href="https://github.com/TFGfraanicardandorsan/wiki/wiki">{t("footer.documentation")}</a>
              </li>
            </ul>
          </div>

          <div>
            <h4>{t("footer.contact_us")}</h4>
            <ul>
              <a href="mailto:delegacion_etsii@us.es">{t("footer.send_email")}</a>
            </ul>
          </div>

        </div>
      </footer>
    </>
  );
}
