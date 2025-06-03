import "../styles/footer-style.css";
import { yearValue } from "../lib/generadorFechas"

export default function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <p>
              <strong>Delegación de Alumnos</strong>
              <br />
              <strong>
                Escuela Técnica Superior de Ingeniería Informática
              </strong>
              <br />
            </p>
          </div>
          <div className="footer-section">
            <p>
              Universidad de Sevilla
              <br />
              Avda. Reina Mercedes s/n,
              <br />
              41012 Sevilla
              <br />
              Tlfno: 954556817 © {yearValue}
            </p>
          </div>
          <div>
            <h4>Políticas</h4>
            <ul>
              <li>
                <a href="/politicaPrivacidad">Política de Privacidad</a>
              </li>
              <li>
                <a href="/cookies">Política de Cookies</a>
              </li>
            </ul>
          </div>

          <div>
            <h4>Guías</h4>
            <ul>
              <li>
                <a href="#">Guía de uso</a>
              </li>
              <li>
                <a href="https://github.com/TFGfraanicardandorsan/wiki/wiki">Documentación</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Contáctanos</h4>
            <ul>
              <a href="mailto:delegacion_etsii@us.es">Envíanos un correo</a>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
