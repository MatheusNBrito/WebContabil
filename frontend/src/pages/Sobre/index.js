import React from "react";
import { Link } from "react-router-dom";
import "./sobre.css";

export default function Sobre() {
  return (
    <div className="sobre-page">
      {/* 🔹 Cabeçalho específico para a página Sobre */}
      <header className="sobre-page-header">
        <h1 className="home-title">Sobre nós</h1>
        <nav className="sobre-page-nav">
          <Link to="/" className="sobre-page-btn">
            Home
          </Link>
          <Link to="/contact" className="sobre-page-btn">
            Contato
          </Link>
          <Link to="/login" className="sobre-page-btn">
            Login
          </Link>
        </nav>
      </header>

      {/* 🔹 Conteúdo Principal */}
      <main className="sobre-page-box">
        <section className="sobre-page-intro">
          <h2 className="sobre-title">Sobre Nossa Empresa</h2>
          <p className="sobre-page-texto">
            Somos uma empresa comprometida em fornecer soluções inovadoras e
            eficientes para nossos clientes. Nossa missão é entregar serviços de
            alta qualidade, sempre focados na satisfação e no sucesso de quem
            confia em nós.
          </p>
        </section>

        <section className="sobre-page-servicos">
          <h2 className="sobre-title">Nossos Serviços</h2>
          <div className="sobre-page-servicos-lista">
            <div className="sobre-page-servico-item">
              <h3 className="sobre-page-subtitulo">Serviço 1</h3>
              <p className="sobre-page-texto">
                Descrição breve do serviço prestado pela empresa.
              </p>
            </div>
            <div className="sobre-page-servico-item">
              <h3 className="sobre-page-subtitulo">Serviço 2</h3>
              <p className="sobre-page-texto">
                Descrição breve do serviço prestado pela empresa.
              </p>
            </div>
            <div className="sobre-page-servico-item">
              <h3 className="sobre-page-subtitulo">Serviço 3</h3>
              <p className="sobre-page-texto">
                Descrição breve do serviço prestado pela empresa.
              </p>
            </div>
          </div>
        </section>

        <section className="sobre-page-diferenciais">
          <h2 className="sobre-title">Por que escolher nossa empresa?</h2>
          <ul>
            <li className="sobre-page-texto">
              Compromisso com a qualidade e inovação
            </li>
            <li className="sobre-page-texto">
              Atendimento personalizado para cada cliente
            </li>
            <li className="sobre-page-texto">
              Profissionais experientes e qualificados
            </li>
          </ul>
        </section>

        {/* 🔹 Container correto para centralizar o botão */}
        <div className="sobre-page-contato-container">
          <Link to="/contact" className="sobre-page-contato-btn">
            Fale Conosco
          </Link>
        </div>
      </main>
    </div>
  );
}
