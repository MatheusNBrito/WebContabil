import React from "react";
import { Link } from "react-router-dom";
import "./styles.css"; 

export default function Home() {
  return (
    <div className="container">
      <header>
        <h1>Calveludo Contábil</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">Sobre</Link>
          <Link to="/contact">Contato</Link>
          <Link to="/register" className="client-area">Cadastre-se</Link>
        </nav>
      </header>

      <main>
        <h2>Bem-vindo ao sistema do Ramos, o ex Calvo!</h2>
        <p>Aguardamos ansiosamente pelo seu dinheiro</p>
        <button className="btn">Conheça mais</button>
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} Nome da Empresa. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
