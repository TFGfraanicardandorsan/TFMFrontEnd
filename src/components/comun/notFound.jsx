import { Link } from 'react-router-dom';
import Footer from "./footer";
import "../../styles/notFound-style.css";
import { useTranslation } from "react-i18next";

const NotFound = () => {
    const { t } = useTranslation();

    return (
        <>
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h1>{t("pages.not_found.title")}</h1>
                <p>{t("pages.not_found.message")}</p>
                <Link to="/">{t("common.back_home")}</Link>
            </div>
            <Footer />
        </>
    );
};

export default NotFound;
