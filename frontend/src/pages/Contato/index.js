import React, { useState } from "react";
import "./contato.css";

export default function Contato() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    mensagem: "",
  });
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("📩 Dados enviados:", formData);
    setSuccessMessage("Mensagem enviada com sucesso!");
    setFormData({ nome: "", email: "", mensagem: "" });
  };

  return (
    <div className="contato-container">
      <section className="contato-box">
        <h1>Entre em Contato</h1>
        <p>Tem alguma dúvida ou quer saber mais? Nos envie uma mensagem!</p>

        {successMessage && <p className="success-message">{successMessage}</p>}

        <form onSubmit={handleSubmit} className="contato-form">
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
            placeholder="Sua Mensagem"
            value={formData.mensagem}
            onChange={handleChange}
            required
          ></textarea>
          <button type="submit" className="contato-btn">Enviar</button>
        </form>
      </section>
    </div>
  );
}
