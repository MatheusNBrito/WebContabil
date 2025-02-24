import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getClients, uploadFileToClient, getClientFiles } from "../../api";
import "./admin.css";

export default function Admin() {
  const [clientes, setClientes] = useState([]);
  const [arquivos, setArquivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentClient, setCurrentClient] = useState(null);

  // Buscar clientes ao carregar o componente
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

  // 🔹 Função para agrupar arquivos por extensão
  const organizarArquivosPorTipo = (arquivos) => {
    const tipos = {
      pdf: [],
      xls: [],
      docx: [],
      outros: [],
    };

    arquivos.forEach((arquivo) => {
      if (arquivo.filename.endsWith(".pdf")) {
        tipos.pdf.push(arquivo);
      } else if (
        arquivo.filename.endsWith(".xls") ||
        arquivo.filename.endsWith(".xlsx")
      ) {
        tipos.xls.push(arquivo);
      } else if (
        arquivo.filename.endsWith(".docx") ||
        arquivo.filename.endsWith(".doc")
      ) {
        tipos.docx.push(arquivo);
      } else {
        tipos.outros.push(arquivo);
      }
    });

    return tipos;
  };

  // 🔹 Função para lidar com o upload de arquivos
  const handleFileUpload = async (clientId) => {
    if (!selectedFile) {
      alert("Selecione um arquivo primeiro!");
      return;
    }

    try {
      // 🔹 Extrair userId e role do localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      const adminId = user.id;
      const userRole = user.role;

      // Verificar se o usuário é um admin
      if (userRole !== "admin") {
        throw new Error("Apenas administradores podem enviar arquivos.");
      }

      // Enviar arquivo para o cliente
      await uploadFileToClient(clientId, adminId, selectedFile);
      alert("Arquivo enviado com sucesso!");

      // Atualizar a lista de arquivos
      const novosArquivos = await getClientFiles(clientId);
      setArquivos(novosArquivos);
    } catch (error) {
      alert(`Erro ao enviar arquivo: ${error.message}`);
    } finally {
      setSelectedFile(null);
      setCurrentClient(null);
    }
  };

  return (
    <div className="admin-page">
      {/* 🔹 Cabeçalho do Admin */}
      <header className="admin-header">
        <h1>Painel do Administrador</h1>
        <nav className="admin-nav">
          <Link to="/" className="nav-btn">
            Home
          </Link>
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

                {/* 🔹 Seção de Upload de Arquivos */}
                <div className="upload-section">
                  <input
                    type="file"
                    onChange={(e) => {
                      setSelectedFile(e.target.files[0]);
                      setCurrentClient(cliente._id);
                    }}
                  />
                  <button onClick={() => handleFileUpload(cliente._id)}>
                    Enviar Arquivo
                  </button>
                </div>

                {/* 🔹 Seção de Arquivos do Cliente */}
                <div className="arquivos-do-cliente">
                  <h4>Arquivos Enviados</h4>

                  {arquivos.some(
                    (arquivo) => arquivo.assignedTo === cliente._id
                  ) ? (
                    (() => {
                      const arquivosCliente = arquivos.filter(
                        (arquivo) => arquivo.assignedTo === cliente._id
                      );
                      const arquivosOrganizados =
                        organizarArquivosPorTipo(arquivosCliente);

                      return (
                        <div className="arquivos-categorias">
                          {Object.entries(arquivosOrganizados).map(
                            ([tipo, lista]) =>
                              lista.length > 0 && (
                                <div key={tipo} className="categoria-arquivos">
                                  <h5>{tipo.toUpperCase()}</h5>
                                  {lista.map((arquivo) => (
                                    <div
                                      key={arquivo._id}
                                      className="arquivo-item"
                                    >
                                      <p>
                                        <strong>Arquivo:</strong>{" "}
                                        {arquivo.filename}
                                      </p>
                                      <a
                                        href={`http://localhost:3000/files/download/${arquivo._id}`}
                                        className="download-btn"
                                      >
                                        📥 Baixar Arquivo
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              )
                          )}
                        </div>
                      );
                    })()
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