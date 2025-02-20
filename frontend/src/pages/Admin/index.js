import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getClients, getClientFiles } from "../../api"; // 🔹 Importando funções da API
import "./admin.css";

export default function Admin() {
  const [clientes, setClientes] = useState([]);
  const [arquivos, setArquivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        // 🔹 Buscar clientes cadastrados
        const clientesData = await getClients();
        setClientes(clientesData);

        // 🔹 Buscar arquivos enviados pelos clientes
        const arquivosData = await getClientFiles();
        setArquivos(arquivosData);
      } catch (err) {
        setError("Erro ao carregar os dados. Tente novamente.");
        console.error("❌ Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="admin-page">
      {/* 🔹 Cabeçalho do Admin */}
      <header className="admin-header">
        <h1>Painel do Administrador</h1>
        <nav className="admin-nav">
          <Link to="/" className="nav-btn">Home</Link>
          <button className="logout-btn">Logout</button>
        </nav>
      </header>

      {/* 🔹 Mensagens de Carregamento e Erro */}
      {loading && <p className="loading">🔄 Carregando...</p>}
      {error && <p className="error">{error}</p>}

      {/* 🔹 Lista de Clientes */}
      <section className="clientes-container">
        <h2>Clientes Cadastrados</h2>
        <div className="clientes-lista">
          {clientes.length > 0 ? (
            clientes.map((cliente) => (
              <div key={cliente._id} className="cliente-item">
                <h3>{cliente.name}</h3>
                <p>Email: {cliente.email}</p>

                {/* 🔹 Seção de Arquivos do Cliente */}
                <div className="arquivos-do-cliente">
                  <h4>Arquivos Enviados</h4>
                  {arquivos.some(arquivo => arquivo.uploadedBy?._id === cliente._id) ? (
                    arquivos
                      .filter(arquivo => arquivo.uploadedBy?._id === cliente._id)
                      .map((arquivo) => (
                        <div key={arquivo._id} className="arquivo-item">
                          <p><strong>Arquivo:</strong> {arquivo.filename}</p>
                          <a href={`http://localhost:3000/files/download/${arquivo._id}`} className="download-btn">
                            📥 Baixar Arquivo
                          </a>
                        </div>
                      ))
                  ) : (
                    <p className="nenhum-arquivo">Nenhum arquivo enviado.</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>Nenhum cliente cadastrado.</p>
          )}
        </div>
      </section>
    </div>
  );
}
