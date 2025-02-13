const express = require("express");
const User = require("./models/User").default || require("./models/User");
const mongoose = require("mongoose"); // 🔹 Certifique-se de importar o mongoose

const router = express.Router();

console.log("✅ Arquivo routes.js foi carregado!");

// Testar se o modelo User está funcionando
// User.find()
//     .then(users => console.log("🔍 Teste do User.find():", users))
//     .catch(err => console.error("❌ Erro no User.find():", err));

// 🔹 Rota de Cadastro
router.post("/register", async (req, res) => {
    console.log("📢 Rota /register foi chamada!");

    try {
        const { name, email, password } = req.body; // 🔹 Removemos `role`

        // Criar usuário no banco de dados como CLIENTE
        const user = await User.create({ name, email, password, role: "client" });

        return res.json({ message: "✅ Usuário cadastrado com sucesso!", user });
    } catch (error) {
        console.error("❌ Erro ao registrar usuário:", error);
        return res.status(500).json({ error: "Erro ao registrar usuário" });
    }
});

router.post("/login", async (req, res) => {
    console.log("📢 Rota /login foi chamada!");

    try {
        const { email, password } = req.body;

        // Buscar usuário pelo email e senha
        const user = await User.findOne({ email, password });

        if (!user) {
            return res.status(400).json({ error: "Email ou senha incorretos" });
        }

        return res.json({ 
            message: "✅ Login bem-sucedido!", 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role // 🔹 Agora retorna a role
            }
        });
    } catch (error) {
        console.error("❌ Erro no login:", error);
        return res.status(500).json({ error: "Erro ao fazer login" });
    }
});

router.post("/admin/register", async (req, res) => {
    console.log("📢 Rota /admin/register foi chamada!");

    try {
        const { name, email, password, adminId } = req.body;

        // 🔹 Verificar se adminId é um ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({ error: "ID de administrador inválido." });
        }

        // 🔹 Buscar o usuário que está tentando criar outro admin
        const adminUser = await User.findById(adminId);

        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ error: "Apenas administradores podem criar novas contas de admin." });
        }

        // Criar usuário como ADMIN
        const newAdmin = await User.create({ name, email, password, role: "admin" });

        return res.json({ message: "✅ Administrador criado com sucesso!", user: newAdmin });
    } catch (error) {
        console.error("❌ Erro ao criar administrador:", error);
        return res.status(500).json({ error: "Erro ao criar administrador" });
    }
});

module.exports = router;
