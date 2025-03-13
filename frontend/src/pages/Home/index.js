import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./home.css";

export default function Home() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null); // Estado para armazenar o token

  // 🔹 Pega o token assim que a página for carregada
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken); // Atualiza o estado
  }, []);

  const handleClientAreaClick = () => {
    console.log("Token atual:", token); // 🔹 Verifica se o token está sendo lido corretamente

    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="home-page">
      {/* 🔹 Cabeçalho */}
      <header className="home-header">
        <h1 className="home-title">Calveludo</h1>
        <nav className="home-nav">
          <Link to="/about">Sobre</Link>
          <Link to="/contact">Contato</Link>
          <button className="home-client-area" onClick={handleClientAreaClick}>
            Login
          </button>
        </nav>
      </header>

      {/* 🔹 Conteúdo Principal */}
      <main className="home-main">
        <h1 className="home-title">Bem-vindo ao sistema do Ramos, o ex Calvo!</h1>
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
