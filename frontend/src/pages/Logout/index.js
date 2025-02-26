import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Logout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/logout"); // 🔹 Chama a rota de logout no backend (opcional)

      // 🔹 Remove os dados do usuário do localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 🔹 Redireciona para a página inicial
      navigate("/");
    } catch (error) {
      console.error("❌ Erro ao fazer logout:", error);
    }
  };

  return (
    <button onClick={handleLogout} className="logout-btn">
      Logout
    </button>
  );
}
