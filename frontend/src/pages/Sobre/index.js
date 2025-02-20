import React from "react";
import { Link } from "react-router-dom"; 
import "./sobre.css";

export default function Sobre() {
  return (
    <div>
      {/* 🔹 Cabeçalho Fixo */}
      <header className="sobre-header">
        <h1>Sobre Nós</h1>
        <nav className="sobre-nav">
          <Link to="/" className="nav-btn">Home</Link>
          <Link to="/register" className="nav-btn">Cadastrar-se</Link>
        </nav>
      </header>

      {/* 🔹 Conteúdo Principal */}
      <div className="sobre-container">
        <main className="sobre-box">
          <section className="intro">
            <h2>Sobre Nossa Empresa</h2>
            <p>
              Somos uma empresa comprometida em fornecer soluções inovadoras e eficientes para nossos clientes.
              Nossa missão é entregar serviços de alta qualidade, sempre focados na satisfação e no sucesso de quem confia em nós.
            </p>
          </section>

          <section className="servicos">
            <h2>Nossos Serviços</h2>
            <div className="servicos-lista">
              <div className="servico-item">
                <h3>Serviço 1</h3>
                <p>Descrição breve do serviço prestado pela empresa.</p>
              </div>
              <div className="servico-item">
                <h3>Serviço 2</h3>
                <p>Descrição breve do serviço prestado pela empresa.</p>
              </div>
              <div className="servico-item">
                <h3>Serviço 3</h3>
                <p>Descrição breve do serviço prestado pela empresa.</p>
              </div>
            </div>
          </section>

          <section className="diferenciais">
            <h2>Por que escolher nossa empresa?</h2>
            <ul>
              <li>Compromisso com a qualidade e inovação</li>
              <li>Atendimento personalizado para cada cliente</li>
              <li>Profissionais experientes e qualificados</li>
            </ul>
          </section>

          <Link to="/contact" className="contato-btn">
            Fale Conosco
          </Link>
        </main>
      </div>
    </div>
  );
}