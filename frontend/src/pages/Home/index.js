import React from "react";
import { Link } from "react-router-dom";
import "./home.css";

export default function Home() {
  return (
    <div className="home-container">
      {/* 🔹 Cabeçalho */}
      <header className="home-header">
      <h2 className="home-title">Calveludo</h2>
        <nav className="home-nav">
          <Link to="/about">Sobre</Link>
          <Link to="/contact">Contato</Link>
          <Link to="/login" className="home-client-area">Área do Cliente</Link>
          <Link to="/register" className="home-client-area">Cadastrar</Link>
        </nav>
      </header>

      {/* 🔹 Conteúdo Principal */}
      <main className="home-main">
        <h2 className="home-title">Bem-vindo ao sistema do Ramos, o ex Calvo!</h2>
        <p className="home-description">Aguardamos ansiosamente pelo seu dinheiro</p>
        <Link to="/about">
          <button className="home-btn">Conheça mais</button>
        </Link>
      </main>

      {/* 🔹 Rodapé */}
      <footer className="home-footer">
        <p>&copy; {new Date().getFullYear()} Nome da Empresa. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
