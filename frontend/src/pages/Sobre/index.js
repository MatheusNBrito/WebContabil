import React from "react";
import "./sobre.css";

export default function Sobre() {
  return (
    <div className="sobre-container">
      {/* Seção de Introdução */}
      <section className="introducao">
        <h1>Sobre Nossa Empresa</h1>
        <p>
          Somos uma empresa comprometida em fornecer soluções inovadoras e eficientes para nossos clientes.
          Nossa missão é entregar serviços de alta qualidade, sempre focados na satisfação e no sucesso de quem confia em nós.
        </p>
      </section>

      {/* Seção de Serviços */}
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

      {/* Seção de Diferenciais */}
      <section className="diferenciais">
        <h2>Por que escolher nossa empresa?</h2>
        <ul>
          <li>🔹 Compromisso com a qualidade e inovação.</li>
          <li>🔹 Atendimento personalizado para cada cliente.</li>
          <li>🔹 Profissionais experientes e qualificados.</li>
        </ul>
      </section>

      {/* Seção de Contato */}
      <section className="contato">
        <h2>Entre em Contato</h2>
        <p>
          Ficou interessado em nossos serviços? Entre em contato e saiba mais!
        </p>
        <button className="contato-btn">Fale Conosco</button>
      </section>
    </div>
  );
}
