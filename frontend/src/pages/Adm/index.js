import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getClients,
  getClientCompanies,
  uploadFilesToCompany,
  getCompanyFiles,
  downloadFile,
} from "../../api";
import "./admin.css";
import "../../global.css";
import axios from "axios";

export default function Admin() {
  const [clientes, setClientes] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [arquivosPorMes, setArquivosPorMes] = useState({}); // 🔹 Agora organizamos por mês
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(""); // 🔹 Mês selecionado pelo usuário
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
    setArquivosPorMes({});

    try {
      const response = await getClientCompanies(clientId);
      setEmpresas(response);
    } catch (error) {
      console.error("❌ Erro ao buscar empresas do cliente:", error);
    }
  };

  const handleCompanyChange = async (companyId) => {
    setSelectedCompany(companyId);
    setArquivosPorMes({});

    try {
      const novosArquivos = await getCompanyFiles(companyId);

      if (novosArquivos.length === 0) {
        setArquivosPorMes({ vazio: [] }); // 🔹 Cria um indicador para empresa sem arquivos
      } else {
        organizarArquivosPorMes(novosArquivos);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar arquivos da empresa:", error);
      setArquivosPorMes({ vazio: [] }); // 🔹 Define estado de empresa sem arquivos
    }
  };

  // 🔹 Organiza os arquivos por mês e ano
  const organizarArquivosPorMes = (arquivos) => {
    const arquivosAgrupados = {};

    arquivos.forEach((file) => {
      const data = new Date(file.createdAt);
      const mesAno = `${data.getFullYear()}-${String(
        data.getMonth() + 1
      ).padStart(2, "0")}`; // Formato: "2024-03"

      if (!arquivosAgrupados[mesAno]) {
        arquivosAgrupados[mesAno] = [];
      }
      arquivosAgrupados[mesAno].push(file);
    });

    setArquivosPorMes(arquivosAgrupados);
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

      setSelectedFiles([]);
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
          <Link to="/register" className="admin-nav-btn">
            Cadastrar
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

      {selectedCompany && // 🔹 Agora só mostra arquivos ou mensagem se houver uma empresa selecionada
        (Object.keys(arquivosPorMes).length > 0 ? (
          <section className="admin-arquivos-section">
            <h2 className="admin-section-title">Arquivos da Empresa</h2>

            {/* 🔹 Filtro para selecionar mês */}
            <select
              className="admin-select"
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">Todos os meses</option>
              {Object.keys(arquivosPorMes).map((mesAno) => (
                <option key={mesAno} value={mesAno}>
                  {new Date(mesAno + "-01").toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  })}
                </option>
              ))}
            </select>

            {/* 🔹 Exibe os arquivos separados por mês */}
            {Object.entries(arquivosPorMes)
              .filter(([mesAno]) => !selectedMonth || selectedMonth === mesAno)
              .map(([mesAno, arquivos]) =>
                arquivos.length > 0 ? (
                  <div key={mesAno} className="admin-arquivos-mes">
                    <h3 className="admin-arquivos-mes-title">
                      {new Date(mesAno + "-01").toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h3>
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
                            <td>
                              {new Date(file.createdAt).toLocaleDateString()}
                            </td>
                            <td className="admin-arquivos-actions">
                              <button
                                className="admin-download-btn"
                                onClick={() =>
                                  downloadFile(file._id, file.filename)
                                }
                              >
                                Baixar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p key={mesAno} className="admin-no-files">
                    📂 Esta empresa ainda não possui arquivos.
                  </p>
                )
              )}
          </section>
        ) : (
          selectedCompany && (
            <p className="admin-no-files">
              Esta empresa ainda não possui arquivos.
            </p>
          )
        ))}
    </div>
  );
}
