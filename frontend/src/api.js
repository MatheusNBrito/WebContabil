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

// 🔹 Função para buscar todos os clientes cadastrados
export const getClients = async () => {
  try {
    const response = await api.get("/admin/users");
    return response.data.users;
  } catch (error) {
    console.error("❌ Erro ao buscar clientes:", error);
    return [];
  }
};

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

export default api;
