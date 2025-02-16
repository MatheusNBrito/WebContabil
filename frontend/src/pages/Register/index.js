import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./styles.css";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulário enviado:", formData);
    // Aqui você pode adicionar a lógica de envio para o backend
  };

  return (
    <div className="register-container">
      <header>
        <h1>Cadastro</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>

      <main className="register-box">
        <h2>Crie sua conta</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Nome Completo"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Senha"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirme sua Senha"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button type="submit">Cadastrar</button>
        </form>
        <p>Já tem uma conta? <Link to="/login">Faça login</Link></p>
      </main>
    </div>
  );
}
