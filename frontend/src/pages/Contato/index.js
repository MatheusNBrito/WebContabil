import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // 🔹 Importando para navegação
import "./contato.css";

export default function Contato() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    mensagem: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate(); // 🔹 Hook para navegação

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulação de envio (pode ser substituído por uma requisição real)
    console.log("📩 Mensagem enviada:", formData);

    setSuccessMessage("Mensagem enviada com sucesso! Redirecionando...");
    
    // 🔹 Aguarda 2 segundos antes de redirecionar para a página inicial
    setTimeout(() => {
      navigate("/");
    }, 4000);

    // Limpa o formulário
    setFormData({ nome: "", email: "", mensagem: "" });
  };

  return (
    <div className="contato-container">
      <div className="contato-box">
        <h1>Entre em Contato</h1>
        <p>Envie sua mensagem e retornaremos o mais breve possível.</p>

        {successMessage && <p className="success-message">{successMessage}</p>}

        <form className="contato-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="nome"
            placeholder="Seu Nome"
            value={formData.nome}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Seu E-mail"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <textarea
            name="mensagem"
            placeholder="Digite sua mensagem..."
            rows="5"
            value={formData.mensagem}
            onChange={handleChange}
            required
          />
          <button type="submit" className="contato-btn">Enviar</button>
        </form>

        {/* 🔹 Botão para voltar para a Home */}
        <Link to="/" className="voltar-btn">Voltar para Home</Link>
      </div>
    </div>
  );
}
