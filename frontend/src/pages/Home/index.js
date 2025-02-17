import React from "react";
import { Link } from "react-router-dom";
import "./home.css";

export default function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-header-title">Calveludo Contábil</h1>
        <nav className="home-nav">
          <Link to="/">Home</Link>
          <Link to="/about">Sobre</Link>
          <Link to="/contact">Contato</Link>
          <Link to="/register" className="home-client-area">Cadastrar</Link>
        </nav>
      </header>

      <main className="home-main">
        <h2 className="home-title">Bem-vindo ao sistema do Ramos, o ex Calvo!</h2>
        <p className="home-description">Aguardamos ansiosamente pelo seu dinheiro</p>
        <button className="home-btn">Conheça mais</button>
      </main>

      <footer className="home-footer">
        <p>&copy; {new Date().getFullYear()} Nome da Empresa. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
