import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./dashboard.css";

export default function Dashboard() {
  const [userFiles, setUserFiles] = useState([]); // 🔹 Arquivos enviados pelo próprio cliente
  const [systemFiles, setSystemFiles] = useState([]); // 🔹 Arquivos enviados pelo admin
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get("http://localhost:3000/files", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserFiles(response.data.userFiles); // 🔹 Arquivos enviados pelo cliente
      setSystemFiles(response.data.systemFiles); // 🔹 Arquivos enviados pelo admin
    } catch (error) {
      console.error("❌ Erro ao buscar arquivos:", error);
    }
};

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Selecione um arquivo para enviar.");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", userId);

    try {
      await axios.post("http://localhost:3000/upload", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      alert("✅ Arquivo enviado com sucesso!");
      fetchFiles();
    } catch (error) {
      console.error("❌ Erro ao enviar arquivo:", error);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await axios.delete(`http://localhost:3000/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("🗑 Arquivo excluído com sucesso!");
      fetchFiles();
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
          <button onClick={handleLogout} className="logout-btn">Sair</button>
        </nav>
      </header>

      <main className="dashboard-page-content">
        <h2 className="dash-title">Upload de Arquivos</h2>
        <div className="dashboard-page-upload-box">
          <input type="file" onChange={handleFileChange} />
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
                      <a
                        href={`http://localhost:3000/files/download/${file._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dashboard-page-download-btn"
                      >
                        Baixar
                      </a>
                      <button className="dashboard-page-delete-btn" onClick={() => handleDelete(file._id)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* 🔹 Seção: Arquivos Enviados pelo Sistema */}
        <section className="dashboard-section system-files">
          <h2 className="dash-title">Arquivos Enviados pelo Sistema</h2>
          {systemFiles.length === 0 ? (
            <p className="no-files-message">Nenhum arquivo foi enviado para você pelo sistema.</p>
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
                {systemFiles.map((file) => (
                  <tr key={file._id}>
                    <td>{file.filename}</td>
                    <td>{new Date(file.createdAt).toLocaleDateString()}</td>
                    <td className="dashboard-page-actions">
                      <a
                        href={`http://localhost:3000/files/download/${file._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dashboard-page-download-btn"
                      >
                        Baixar
                      </a>
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
