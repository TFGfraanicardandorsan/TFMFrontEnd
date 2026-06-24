import Footer from "./footer";
import "../../styles/policy-common-style.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  const sections = t("legal.privacy.sections", { returnObjects: true });

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
          <h1>{t("legal.privacy.title")}</h1>
          <p>{t("legal.privacy.updated")}</p>
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
          </section>
        ))}
      </div>
      <Footer />
    </>
  );
}
