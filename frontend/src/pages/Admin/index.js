import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./admin.css";

export default function Admin() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Função para buscar os clientes
  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem("token"); // Pegando o token salvo no login

      if (!token) {
        setError("Usuário não autenticado.");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:3000/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`, // 
        },
      });

      setClientes(response.data.users);
      setLoading(false);
    } catch (error) {
      console.error("❌ Erro ao buscar clientes:", error);
      setError("Erro ao buscar clientes.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return (
    <div className="admin-page">
      {/* 🔹 Cabeçalho */}
      <header className="admin-header">
        <h1>Painel do Administrador</h1>
        <nav className="admin-nav">
          <Link to="/" className="nav-btn">Home</Link>
          <button className="logout-btn">Logout</button>
        </nav>
      </header>

      {/* 🔹 Lista de Clientes */}
      <section className="clientes-container">
        <h2>Clientes Cadastrados</h2>

        {loading ? (
          <p>Carregando clientes...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="clientes-lista">
            {clientes.length > 0 ? (
              clientes.map((cliente) => (
                <div className="cliente-item" key={cliente._id}>
                  <h3>{cliente.name}</h3>
                  <p>Email: {cliente.email}</p>
                  <button className="ver-arquivos-btn">Ver Arquivos</button>
                </div>
              ))
            ) : (
              <p>Nenhum cliente encontrado.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
