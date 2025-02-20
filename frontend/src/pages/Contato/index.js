import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import "./contato.css";

export default function Contato() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    mensagem: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("📩 Mensagem enviada:", formData);

    setSuccessMessage("Mensagem enviada com sucesso! Redirecionando...");
    
    setTimeout(() => {
      navigate("/");
    }, 4000);

    setFormData({ nome: "", email: "", mensagem: "" });
  };

  return (
    <div className="contato-container">
      {/* 🔹 Cabeçalho igual ao Login */}
      <header className="contato-header">
        <h1>Entre em Contato</h1>
        <nav className="contato-nav">
          <Link to="/" className="nav-btn">Home</Link>
          <Link to="/register" className="nav-btn">Cadastrar-se</Link>
        </nav>
      </header>

      {/* 🔹 Formulário de Contato */}
      <main className="contato-box">
        <h2>Envie sua mensagem</h2>
        <p>Retornaremos o mais breve possível.</p>

        {successMessage && <p className="success-message">{successMessage}</p>}

        <form className="contato-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="nome"
            placeholder="Seu Nome"
            value={formData.nome}
            onChange={handleChange}
            required
            className="contato-input"
          />
          <input
            type="email"
            name="email"
            placeholder="Seu E-mail"
            value={formData.email}
            onChange={handleChange}
            required
            className="contato-input"
          />
          <textarea
            name="mensagem"
            placeholder="Digite sua mensagem..."
            rows="5"
            value={formData.mensagem}
            onChange={handleChange}
            required
            className="contato-input"
          />
          <button type="submit" className="contato-btn">Enviar</button>
        </form>

        
      </main>
    </div>
  );
}
