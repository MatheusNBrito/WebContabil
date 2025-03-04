import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", 
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔹 Adiciona automaticamente o token de autenticação em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Buscar todos os clientes cadastrados
export const getClients = async () => {
  try {
    const response = await api.get("/admin/users");
    return response.data.users;
  } catch (error) {
    console.error("❌ Erro ao buscar clientes:", error);
    return [];
  }
};

// 🔹 Buscar arquivos de clientes cadastrados (NÃO UTILIZADO PARA EMPRESAS)
export const getClientFiles = async () => {
  try {
    const response = await api.get("/admin/files");

    // 🔹 Filtra arquivos que não têm um usuário válido
    const validFiles = response.data.files.filter(file => file.uploadedBy);

    return validFiles;
  } catch (error) {
    console.error("❌ Erro ao buscar arquivos:", error);
    return [];
  }
};

// 🔹 Buscar todas as empresas associadas a um cliente específico
export const getClientCompanies = async (clientId) => {
  try {
    const response = await api.get(`/admin/client/${clientId}/companies`);
    return response.data.companies;
  } catch (error) {
    console.error("❌ Erro ao buscar empresas do cliente:", error);
    return [];
  }
};

// 🔹 Enviar arquivo para uma empresa específica
export const uploadFileToCompany = async (companyId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("companyId", companyId);

  try {
    const response = await api.post("/admin/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao enviar arquivo para empresa:", error);
    throw error;
  }
};

// 🔹 Buscar arquivos de uma empresa específica
export const getCompanyFiles = async (companyId) => {
  try {
    const response = await api.get(`/admin/company/${companyId}/files`);
    return response.data.files;
  } catch (error) {
    console.error("❌ Erro ao buscar arquivos da empresa:", error);
    return [];
  }
};

export const downloadFile = async (fileId, fileName) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:3000/files/download/${fileId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Erro ao baixar arquivo.");
    }

    // Criar um blob para forçar o download do arquivo
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (error) {
    console.error("❌ Erro ao baixar arquivo:", error);
    alert("Erro ao baixar arquivo. Verifique a autenticação.");
  }
};


export default api;
