const jwt = require("jsonwebtoken");
const User = require("../models/User");
const SECRET_KEY = "seu_segredo_super_secreto"; // 🔹 Defina isso no .env

function checkRole(requiredRole) {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ error: "Token não fornecido." });
            }

            const token = authHeader.split(" ")[1]; // 🔹 Extrai o token do header
            if (!token) {
                return res.status(401).json({ error: "Token inválido." });
            }

            const decoded = jwt.verify(token, SECRET_KEY); // 🔹 Decodifica o token
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(404).json({ error: "Usuário não encontrado." });
            }

            if (user.role !== requiredRole) {
                return res.status(403).json({ error: `Acesso negado. Apenas ${requiredRole}s podem acessar esta rota.` });
            }

            req.user = user; // 🔹 Adiciona usuário autenticado ao request
            next();
        } catch (error) {
            console.error("❌ Erro na autenticação:", error);
            res.status(500).json({ error: "Erro na autenticação." });
        }
    };
}

module.exports = { checkRole };
