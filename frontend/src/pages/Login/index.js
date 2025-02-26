import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api"; 
import "./login.css";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(""); 
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 

    try {
      const response = await api.post("/login", formData);

      // 🔹 Salvar o token no localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user)); 

      // 🔹 Verificar se o usuário é admin ou cliente
      if (response.data.user.role === "admin") {
        navigate("/admin"); // Redireciona para o painel Admin
      } else {
        navigate("/dashboard"); // Redireciona para o painel Cliente
      }
    } catch (error) {
      console.error("❌ Erro no login:", error);
      setError(error.response?.data?.error || "Erro ao fazer login.");
    }
  };


  return (
    <div className="login-page">
      <header className="login-header">
        <h1 className="login-title">Login</h1>
        <nav className="login-nav">
          <Link to="/">Home</Link>
          <Link to="/register">Cadastre-se</Link>
        </nav>
      </header>

      <main className="login-box">
        <h2>Entre na sua conta</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleChange}
            required
            className="login-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Senha"
            value={formData.password}
            onChange={handleChange}
            required
            className="login-input"
          />
          <button type="submit" className="login-btn">Entrar</button>
        </form>
        <p className="login-footer">
          Não tem uma conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </main>
    </div>
  );
}
