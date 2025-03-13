import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./account-management.css"; // 🔹 Importando o CSS específico

export default function AccountManagement() {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const handleUpdateEmail = async () => {
    try {
      const response = await axios.patch(
        "http://localhost:3000/update-email",
        { newEmail, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao atualizar e-mail.");
      setMessage("");
    }
  };

  const handleUpdatePassword = async () => {
    try {
      const response = await axios.patch(
        "http://localhost:3000/update-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao atualizar senha.");
      setMessage("");
    }
  };

  return (
    <div className="account-management-page">
      {/* 🔹 Header padrão */}
      <header className="account-management-header">
        <h1 className="account-management-title">Gerenciamento de Conta</h1>
        <nav className="account-management-nav">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
        </nav>
      </header>

      <main className="account-management-container">
        {/* 🔹 Mensagens de erro e sucesso */}
        {message && <p className="account-success-message">{message}</p>}
        {error && <p className="account-error-message">{error}</p>}

        {/* 🔹 Seção para Alterar E-mail */}
        <div className="account-management-section">
          <h3 className="account-management-subtitle">Alterar E-mail</h3>
          <input
            type="email"
            placeholder="Novo E-mail"
            className="account-management-input"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha Atual"
            className="account-management-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="account-management-btn" onClick={handleUpdateEmail}>
            Atualizar E-mail
          </button>
        </div>

        {/* 🔹 Seção para Alterar Senha */}
        <div className="account-management-section">
          <h3 className="account-management-subtitle">Alterar Senha</h3>
          <input
            type="password"
            placeholder="Senha Atual"
            className="account-management-input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Nova Senha"
            className="account-management-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button className="account-management-btn" onClick={handleUpdatePassword}>
            Atualizar Senha
          </button>
        </div>
      </main>
    </div>
  );
}
