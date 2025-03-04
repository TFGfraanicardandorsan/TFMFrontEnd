import Footer from "./footer";
import Navbar from "./navbar";
import "../styles/home-style.css"
export default function Home() {
    return (
        <div className="home-container">
            <Navbar />
            <div className="content">
                <h1 style={{ color: 'red' }}>Bienvenido a Permutas ETSII</h1>
                <p>Una plataforma para gestionar permutas de manera eficiente.</p>
                <button className="explore-button">
                    Explorar Permutas 🔄
                </button>
            </div>
            <Footer />
        </div>
    );
}
