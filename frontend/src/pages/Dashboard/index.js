import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./dashboard.css";
import { downloadFile } from "../../api";

export default function Dashboard() {
  const [companies, setCompanies] = useState([]); // 🔹 Lista de empresas do usuário
  const [selectedCompany, setSelectedCompany] = useState(""); // 🔹 Empresa selecionada
  const [newCompanyName, setNewCompanyName] = useState(""); // 🔹 Nome da empresa a ser cadastrada
  const [userFiles, setUserFiles] = useState([]); // 🔹 Arquivos enviados pelo cliente dentro da empresa
  const [selectedFiles, setSelectedFiles] = useState([]); // Agora começa como um array vazio
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const [adminFiles, setAdminFiles] = useState([]); // 🔹 Arquivos enviados pelo Admin
  const [notification, setNotification] = useState(""); // 🔔 Estado para notificações

  useEffect(() => {
    fetchCompanies();
  }, []);

  // 🔹 Buscar empresas do usuário
  const fetchCompanies = async () => {
    try {
      const response = await axios.get("http://localhost:3000/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(response.data.companies);

      // Se houver empresas, definir a primeira como selecionada
      if (response.data.companies.length > 0) {
        setSelectedCompany(response.data.companies[0]._id);
        fetchFiles(response.data.companies[0]._id);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar empresas:", error);
    }
  };

  // 🔹 Criar uma nova empresa
  const handleCreateCompany = async () => {
    if (!newCompanyName.trim()) {
      alert("Digite um nome para a empresa.");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/companies",
        { name: newCompanyName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Atualizar a lista de empresas
      fetchCompanies();
      // Definir a nova empresa como selecionada
      setSelectedCompany(response.data.company._id);
      fetchFiles(response.data.company._id);
      setNewCompanyName("");

      // 🔔 Exibir notificação de sucesso
      setNotification("Empresa cadastrada com sucesso!");
      setTimeout(() => setNotification(""), 3000);
    } catch (error) {
      console.error("❌ Erro ao criar empresa:", error);
      setNotification("❌ Erro ao criar empresa.");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  // 🔹 Buscar arquivos filtrados pela empresa selecionada
  const fetchFiles = async (companyId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/files/${companyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Obtendo todos os arquivos da resposta
      const allFiles = response.data.files;

      // 🔹 Garantir que uploadedBy esteja definido antes de acessar `_id` e `role`
      const userFiles = allFiles.filter(
        (file) =>
          file.uploadedBy &&
          file.uploadedBy._id.toString() === userId &&
          file.company.toString() === companyId
      );

      const adminFiles = allFiles.filter(
        (file) =>
          file.uploadedBy &&
          file.uploadedBy.role === "admin" &&
          file.company.toString() === companyId
      );

      // Atualiza os estados corretamente
      setUserFiles(userFiles);
      setAdminFiles(adminFiles);
    } catch (error) {
      console.error("❌ Erro ao buscar arquivos:", error);
    }
  };

  // 🔹 Atualizar empresa selecionada e buscar arquivos
  const handleCompanyChange = (e) => {
    setSelectedCompany(e.target.value);
    fetchFiles(e.target.value);
  };

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert("Selecione pelo menos um arquivo para enviar.");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("userId", userId);
    formData.append("companyId", selectedCompany);

    try {
      await axios.post("http://localhost:3000/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("✅ Arquivos enviados com sucesso!");
      // 🔹 Atualiza a lista de arquivos automaticamente
      fetchFiles(selectedCompany);

      // 🔹 Limpa os arquivos selecionados após o envio
      setSelectedFiles([]);
    } catch (error) {
      console.error("❌ Erro ao enviar arquivos:", error);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await axios.delete(`http://localhost:3000/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // alert("🗑 Arquivo excluído com sucesso!");
      fetchFiles(selectedCompany);
    } catch (error) {
      console.error("❌ Erro ao excluir arquivo:", error);
      alert("Erro ao excluir arquivo. Verifique o console para mais detalhes.");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/logout");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/");
    } catch (error) {
      console.error("❌ Erro ao fazer logout:", error);
    }
  };

  return (
    <div className="dashboard-page-container">
      <header className="dashboard-page-header">
        <h1 className="dashboard-title">Área do Cliente</h1>
        <nav className="dashboard-page-nav">
          <Link to="/">Home</Link>
          <button onClick={handleLogout} className="logout-btn">
            Sair
          </button>
        </nav>
      </header>

      <main className="dashboard-page-content">
        <h2 className="dash-title">Gerenciar Empresas</h2>

        {/* 🔹 Formulário para cadastrar nova empresa */}
        <div className="dashboard-page-new-company">
          <input
            type="text"
            placeholder="Nome da nova empresa"
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
          />
          <button onClick={handleCreateCompany}>Cadastrar</button>
        </div>

        {/* 🔔 Exibir notificação */}
        {notification && <div className="notification">{notification}</div>}

        {/* 🔹 Seleção de Empresa */}
        <div className="dashboard-page-select">
          <label>Escolha a Empresa:</label>
          <select value={selectedCompany} onChange={handleCompanyChange}>
            {companies.map((company) => (
              <option key={company._id} value={company._id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <h2 className="dash-title">Upload de Arquivos</h2>
        <div className="dashboard-page-upload-box">
          {/* Input para selecionar múltiplos arquivos */}
          <input
            type="file"
            class="form-control"
            aria-describedby="inputGroupFileAddon04"
            aria-label="Upload"
            multiple
            onChange={handleFileChange}
          />

          {/* Lista de arquivos selecionados */}
          {selectedFiles.length > 0 && (
            <div className="dashboard-selected-files">
              <h4>Arquivos Selecionados:</h4>
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Botão de Envio */}
          <button onClick={handleUpload}>Enviar</button>
        </div>

        {/* 🔹 Seção: Meus Arquivos */}
        <section className="dashboard-section user-files">
          <h2 className="dash-title">Meus Arquivos</h2>
          {userFiles.length === 0 ? (
            <p className="no-files-message">Nenhum arquivo enviado por você.</p>
          ) : (
            <table className="dashboard-page-file-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Data de Envio</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {userFiles.map((file) => (
                  <tr key={file._id}>
                    <td>{file.filename}</td>
                    <td>{new Date(file.createdAt).toLocaleDateString()}</td>
                    <td className="dashboard-page-actions">
                      <button
                        className="dashboard-download-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          downloadFile(file._id, file.filename);
                        }}
                      >
                        Baixar
                      </button>

                      <button
                        className="dashboard-page-delete-btn"
                        onClick={() => handleDelete(file._id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        {/* 🔹 Seção: Arquivos enviados pelo sistema (Admin) */}
        <section className="dashboard-section admin-files">
          <h2 className="dash-title">Arquivos enviados pelo sistema</h2>
          {adminFiles.length === 0 ? (
            <p className="no-files-message">
              Nenhum arquivo enviado pelo sistema.
            </p>
          ) : (
            <table className="dashboard-page-file-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Data de Envio</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {adminFiles.map((file) => (
                  <tr key={file._id}>
                    <td>{file.filename}</td>
                    <td>{new Date(file.createdAt).toLocaleDateString()}</td>
                    <td className="dashboard-page-actions">
                      <button
                        className="dashboard-download-btn"
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
          )}
        </section>
      </main>
    </div>
  );
}
