import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./dashboard.css";

export default function Dashboard() {
  const [files, setFiles] = useState([]); // Estado para armazenar arquivos

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem("token"); // Obtém o token salvo
        console.log("📌 Token enviado na requisição:", token); // 🔍 Log do token

        const response = await axios.get("http://localhost:3000/files", {
          headers: { Authorization: `Bearer ${token}` }, // Envia o token no header
        });
        
        console.log("✅ Arquivos recebidos:", response.data.files); // Debug

        setFiles(response.data.files); // Atualiza o estado com os arquivos recebidos
      } catch (error) {
        console.error("❌ Erro ao buscar arquivos:", error);
      }
    };

    fetchFiles();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Área do Cliente</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/logout">Sair</Link>
        </nav>
      </header>

      <main className="dashboard-content">
        <h2>Meus Arquivos</h2>

        {files.length === 0 ? (
          <p>Nenhum arquivo encontrado.</p>
        ) : (
          <table className="file-table">
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
                  <td>
                    <a
                      href={`http://localhost:3000/files/download/${file._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-btn"
                    >
                      Baixar
                    </a>
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
