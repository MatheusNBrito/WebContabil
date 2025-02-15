const User = require("../models/User");

module.exports = {
    async register(req, res) {
        console.log("📢 Rota /register foi chamada!");

        try {
            const { name, email, password } = req.body;

            // Criar usuário no banco de dados
            const user = await User.create({ name, email, password });

            return res.json({ message: "✅ Usuário cadastrado com sucesso!", user });
        } catch (error) {
            console.error("❌ Erro ao registrar usuário:", error);
            return res.status(500).json({ error: "Erro ao registrar usuário" });
        }
    },

    async login(req, res) {
        console.log("📢 Rota /login foi chamada!");

        try {
            const { email, password } = req.body;

            // Procurar usuário no banco de dados
            const user = await User.findOne({ email, password });

            if (!user) {
                return res.status(400).json({ error: "Email ou senha incorretos" });
            }

            return res.json({ message: "✅ Login bem-sucedido!", user });
        } catch (error) {
            console.error("❌ Erro no login:", error);
            return res.status(500).json({ error: "Erro ao fazer login" });
        }
    }
};
