import { Link } from 'react-router-dom';
import Footer from "./footer";
import "../../styles/unauthorized-style.css";
import { useTranslation } from "react-i18next";

export default function Unauthorized() {
    const { t } = useTranslation();

    return (
        <>
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h1>{t("pages.unauthorized.title")}</h1>
                <p>{t("pages.unauthorized.message")}</p>
                <Link to="/">{t("common.back_home")}</Link>
            </div>
            <Footer />
        </>
    );
};
