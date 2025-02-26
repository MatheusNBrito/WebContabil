import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./dashboard.css";


export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const token = localStorage.getItem("token");
  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get("http://localhost:3000/files", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(response.data.files);
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
      fetchFiles(); // Atualiza a lista de arquivos
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
        fetchFiles(); // Atualiza a lista de arquivos
    } catch (error) {
        console.error("❌ Erro ao excluir arquivo:", error);
        alert("Erro ao excluir arquivo. Verifique o console para mais detalhes.");
    }
};

return (
  <div className="dashboard-page-container">
    <header className="dashboard-page-header">
      <h1 className="dashboard-title">Área do Cliente</h1>
      <nav className="dashboard-page-nav">
        <Link to="/">Home</Link>
        <Link to="/logout">Sair</Link>
      </nav>
    </header>

    <main className="dashboard-page-content">
      <h2 className="dash-title">Upload de Arquivos</h2>
      <div className="dashboard-page-upload-box">
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Enviar</button>
      </div>

      <h2 className="dash-title">Meus Arquivos</h2>
      {files.length === 0 ? (
        <p>Nenhum arquivo encontrado.</p>
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
            {files.map((file) => (
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
    </main>
  </div>
);
}