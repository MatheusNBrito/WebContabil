const User = require("../models/User");

function checkRole(requiredRole) {
    return async (req, res, next) => {
        try {
            const { userId } = req.body; // O cliente deve enviar seu ID no corpo da requisição

            if (!userId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ error: "Usuário não encontrado." });
            }

            if (user.role !== requiredRole) {
                return res.status(403).json({ error: `Acesso negado. Apenas ${requiredRole}s podem acessar esta rota.` });
            }

            req.user = user; // Adiciona o usuário ao request para uso futuro
            next();
        } catch (error) {
            console.error("❌ Erro na autenticação:", error);
            res.status(500).json({ error: "Erro na autenticação." });
        }
    };
}

module.exports = { checkRole };
