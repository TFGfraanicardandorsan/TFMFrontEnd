import '../styles/footer-style.css';

export default function Footer() {


    return (
        <>

<footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <p>
                        <strong>Escuela Técnica Superior de Ingeniería Informática</strong><br />
                        Universidad de Sevilla<br />
                        Avda. Reina Mercedes s/n,<br />
                        41012 Sevilla<br />
                        Tlfno: 954556817 © 2025
                    </p>
                    {/* <div className="social-icons">
                        <a href="#"><img src="/assets/icon-facebook.png" alt="Facebook" width="20" /></a>
                        <a href="#"><img src="/assets/icon-twitter.png" alt="Twitter" width="20" /></a>
                        <a href="#"><img src="/assets/icon-youtube.png" alt="YouTube" width="20" /></a>
                        <a href="#"><img src="/assets/icon-linkedin.png" alt="LinkedIn" width="20" /></a>
                    </div> */}
                </div>

                <div>
                    <h4>Políticas</h4>
                    <ul>
                        <li><a href="#">Política de Privacidad</a></li>
                        <li><a href="#">Política de Cookies</a></li>
                    </ul>
                </div>

                <div>
                    <h4>Guías</h4>
                    <ul>
                        <li><a href="#">Guía de uso</a></li>
                        <li><a href="#">Documentación</a></li>
                    </ul>
                </div>

                <div>
                    <h4>Resources</h4>
                    <ul>
                        <li><a href="#">Blog</a></li>
                        <li><a href="#">FAQ</a></li>
                    </ul>
                </div>
            </div>
        </footer>



        </>
    )
}