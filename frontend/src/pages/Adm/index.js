import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getClients,
  getClientCompanies,
  uploadFilesToCompany, // 🔹 Modificado para múltiplos arquivos
  getCompanyFiles,
  downloadFile,
} from "../../api";
import "./admin.css";
import "../../global.css";
import axios from "axios";

export default function Admin() {
  const [clientes, setClientes] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [arquivos, setArquivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]); // 🔹 Alterado para múltiplos arquivos
  const [selectedCompany, setSelectedCompany] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        const clientesData = await getClients();
        setClientes(clientesData);
      } catch (err) {
        setError("Erro ao carregar os dados. Tente novamente.");
        console.error("❌ Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleClientChange = async (clientId) => {
    setSelectedCompany(null);
    setEmpresas([]);
    setArquivos([]);

    try {
      const response = await getClientCompanies(clientId);
      setEmpresas(response);
    } catch (error) {
      console.error("❌ Erro ao buscar empresas do cliente:", error);
    }
  };

  const handleCompanyChange = async (companyId) => {
    setSelectedCompany(companyId);
    setArquivos([]);

    try {
      const novosArquivos = await getCompanyFiles(companyId);
      setArquivos(novosArquivos);
    } catch (error) {
      console.error("❌ Erro ao buscar arquivos da empresa:", error);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert("Selecione pelo menos um arquivo para enviar.");
      return;
    }

    if (!selectedCompany) {
      alert("Selecione uma empresa antes de enviar o arquivo!");
      return;
    }

    try {
      await uploadFilesToCompany(selectedCompany, selectedFiles);
      alert("✅ Arquivos enviados com sucesso!");

      // 🔹 Atualiza a lista de arquivos automaticamente após o envio
      setTimeout(() => {
        handleCompanyChange(selectedCompany);
      }, 1000);

      setSelectedFiles([]); // 🔹 Limpa os arquivos selecionados após o envio
    } catch (error) {
      alert(`❌ Erro ao enviar arquivos: ${error.message}`);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1 className="admin-title">Painel do Administrador</h1>
        <nav className="admin-nav">
          <Link to="/" className="admin-nav-btn">
            Home
          </Link>
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
            className="admin-logout-btn"
          >
            Sair
          </button>
        </nav>
      </header>

      {loading && <p className="admin-loading">🔄 Carregando...</p>}
      {error && <p className="admin-error">{error}</p>}

      <section className="admin-clientes-section">
        <h2 className="admin-section-title">Selecionar Cliente</h2>
        <select
          className="admin-select"
          onChange={(e) => handleClientChange(e.target.value)}
        >
          <option value="">Escolha um cliente...</option>
          {clientes.map((cliente) => (
            <option key={cliente._id} value={cliente._id}>
              {cliente.name}
            </option>
          ))}
        </select>
      </section>

      {empresas.length > 0 && (
        <section className="admin-empresas-section">
          <h2 className="admin-section-title">Selecionar Empresa</h2>
          <select
            className="admin-select"
            onChange={(e) => handleCompanyChange(e.target.value)}
          >
            <option value="">Escolha uma empresa...</option>
            {empresas.map((empresa) => (
              <option key={empresa._id} value={empresa._id}>
                {empresa.name}
              </option>
            ))}
          </select>
        </section>
      )}

      {arquivos.length > 0 && (
        <section className="admin-arquivos-section">
          <h2 className="admin-section-title">Arquivos da Empresa</h2>
          <table className="admin-arquivos-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Data de Envio</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {arquivos.map((file) => (
                <tr key={file._id}>
                  <td>{file.filename}</td>
                  <td>{new Date(file.createdAt).toLocaleDateString()}</td>
                  <td className="admin-arquivos-actions">
                    <button
                      className="admin-download-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        downloadFile(file._id, file.filename);
                      }}
                    >
                      Baixar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {selectedCompany && (
        <section className="admin-upload-section">
          <h2 className="admin-section-title">Upload de Arquivos</h2>
          <input
            type="file"
            className="admin-file-input"
            multiple // 🔹 Permitir múltiplos arquivos
            onChange={(e) => setSelectedFiles([...e.target.files])}
          />
          {selectedFiles.length > 0 && (
            <div className="admin-selected-files">
              <h4>Arquivos Selecionados:</h4>
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
          <button className="admin-upload-btn" onClick={handleFileUpload}>
            Enviar
          </button>
        </section>
      )}
    </div>
  );
}
