import "../../styles/modal.css";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

export default function Modal({ title, message, onConfirm, onCancel }) {
  const { t } = useTranslation();

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="confirm" onClick={onConfirm}>{t("common.modal.informed")}</button>
          <button className="cancel" onClick={onCancel}>{t("common.close")}</button>
        </div>
      </div>
    </div>
  );
}

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
