import React from "react";
import { Link } from "react-router-dom";
import "./styles.css"; // Certifique-se de que este arquivo existe

export default function Home() {
  return (
    <div className="container">
      <header>
        <h1>Nome da Empresa</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">Sobre</Link>
          <Link to="/contact">Contato</Link>
          <Link to="/login" className="client-area">Área do Cliente</Link>
        </nav>
      </header>

      <main>
        <h2>Bem-vindo ao nosso sistema!</h2>
        <p>É bom te conhecer!</p>
        <button className="btn">Conheça mais</button>
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} Nome da Empresa. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
