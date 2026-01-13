import Footer from "./footer";
import { Link } from "react-router-dom";
import "../../../styles/cookies-style.css";
export default function PrivacyPolicy() {
  return (
    <>
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Link to="/">Volver a la página principal</Link>
      </div>
      <div className="cookies-policy">
        <br />
        <br />
        <h1>Política de Cookies</h1>
        <p className="actualizacion">Última actualización: Abril 2025</p>

        <section>
          <h2>1. ¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en tu
            dispositivo cuando visitas un sitio web. Estas permiten que el sitio
            web recuerde tus acciones y preferencias (como inicio de sesión,
            idioma, tamaño de fuente y otras configuraciones) durante un período
            de tiempo.
          </p>
        </section>

        <section>
          <h2>2. ¿Qué tipos de cookies utilizamos?</h2>
          <p>
            En nuestra aplicación utilizamos los siguientes tipos de cookies:
          </p>
          <ul className="cookies-list">
            <li>
              <strong>Cookies esenciales:</strong> Son necesarias para el
              funcionamiento básico de la aplicación y no pueden ser
              desactivadas.
            </li>
            <li>
              <strong>Cookies de funcionalidad:</strong> Permiten recordar tus
              preferencias y mejorar tu experiencia de usuario.
            </li>
            <li>
              <strong>Cookies analíticas:</strong> Nos ayudan a entender cómo
              los usuarios interactúan con nuestra aplicación, recopilando
              información de manera anónima.
            </li>
          </ul>
        </section>
        <section>
          <h2>3. ¿Cómo puedes gestionar las cookies?</h2>
          <p>
            Puedes gestionar o desactivar las cookies a través de la
            configuración de tu navegador. Ten en cuenta que desactivar ciertas
            cookies puede afectar la funcionalidad de la aplicación.
          </p>
          <p>
            A continuación, te proporcionamos enlaces a las instrucciones para
            gestionar cookies en los navegadores más populares:
          </p>
          <br />
          <ul>
            <li>
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Chrome
              </a>
            </li>
            <li>
              <a
                href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a
                href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
              >
                Safari
              </a>
            </li>
            <li>
              <a
                href="https://support.microsoft.com/es-es/windows/administrar-cookies-en-microsoft-edge-ver-permitir-bloquear-eliminar-y-usar-168dab11-0753-043d-7c16-ede5947fc64d"
                target="_blank"
                rel="noopener noreferrer"
              >
                Microsoft Edge
              </a>
            </li>
          </ul>
          <br />
        </section>

        <section>
          <h2>4. Cambios a esta política</h2>
          <p>
            Podemos actualizar nuestra Política de Cookies de vez en cuando. Te
            notificaremos sobre cambios importantes publicando una nueva versión
            en esta página.
          </p>
        </section>

        <section>
          <h2>5. Contacto</h2>
          <p>
            Si tienes alguna pregunta o inquietud sobre nuestra Política de
            Cookies, no dudes en contactarnos:
          </p>
          <br />
          <ul>
            <li>Email: delegacion_etsii@us.es</li>
            <li>Dirección: Avda. Reina Mercedes s/n, 41012 Sevilla</li>
          </ul>
          <br />
        </section>
      </div>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <Footer />
    </>
  );
}
