import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Importação do axios
import "./register.css";

export default function Register() {
  const navigate = useNavigate(); // Para redirecionamento após cadastro
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState(""); // Estado para mensagens de erro
  const [successMessage, setSuccessMessage] = useState(""); // Estado para sucesso

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação simples
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("As senhas não coincidem!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      setSuccessMessage("Cadastro realizado com sucesso!");
      setErrorMessage(""); // Limpa mensagem de erro
      setTimeout(() => {
        navigate("/login"); // Redireciona para login após 2s
      }, 2000);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error || "Erro ao cadastrar. Tente novamente."
      );
      setSuccessMessage(""); // Limpa mensagem de sucesso
    }
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

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

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
        <p>
          Já tem uma conta? <Link to="/login">Faça login</Link>
        </p>
      </main>
    </div>
  );
}
