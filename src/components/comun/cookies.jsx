import Footer from "./footer";
import { Link } from "react-router-dom";
import "../../styles/policy-common-style.css";
import { useTranslation } from "react-i18next";

const browserLinks = [
  {
    href: "https://support.google.com/chrome/answer/95647",
    label: "Google Chrome"
  },
  {
    href: "https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web",
    label: "Mozilla Firefox"
  },
  {
    href: "https://support.apple.com/es-es/guide/safari/sfri11471/mac",
    label: "Safari"
  },
  {
    href: "https://support.microsoft.com/es-es/windows/administrar-cookies-en-microsoft-edge-ver-permitir-bloquear-eliminar-y-usar-168dab11-0753-043d-7c16-ede5947fc64d",
    label: "Microsoft Edge"
  }
];

export default function CookiesPolicy() {
  const { t } = useTranslation();
  const sections = t("legal.cookies.sections", { returnObjects: true });

  const renderItem = (item) => {
    if (typeof item === "string") {
      return item;
    }

    return (
      <>
        <strong>{item.label}</strong> {item.text}
      </>
    );
  };

  return (
    <>
      <div className="policy-container">
        <div className="back-link-container">
          <Link to="/" className="back-link">{t("common.back_home")}</Link>
        </div>

        <div className="policy-header">
          <h1>{t("legal.cookies.title")}</h1>
          <p>{t("legal.cookies.updated")}</p>
        </div>

        {sections.map((section) => (
          <section className="policy-section" key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.items && (
              <ul>
                {section.items.map((item) => (
                  <li key={typeof item === "string" ? item : `${item.label}-${item.text}`}>
                    {renderItem(item)}
                  </li>
                ))}
              </ul>
            )}
            {section.browserLinks && (
              <ul>
                {browserLinks.map((browser) => (
                  <li key={browser.label}>
                    <a href={browser.href} target="_blank" rel="noopener noreferrer">
                      {browser.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
      <Footer />
    </>
  );
}
