const express = require("express");
const User = require("./models/User").default || require("./models/User");
const mongoose = require("mongoose"); // 🔹 Certifique-se de importar o mongoose
const upload = require("./config/multer"); // 🔹 Certifique-se de importar o multer corretamente
const File = require("./models/File");
const router = express.Router();
const fs = require("fs");
const Notification = require("./models/Notification");
const { checkRole } = require("./middleware/auth");


console.log("✅ Arquivo routes.js foi carregado!");

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

// 🔹 Apenas administradores podem listar todos os usuários
router.get("/admin/users", checkRole("admin"), async (req, res) => {
    console.log("📢 Rota /admin/users foi chamada!");

    try {
        const users = await User.find({}, "-password"); // 🔹 Não retorna a senha dos usuários
        return res.json({ users });
    } catch (error) {
        console.error("❌ Erro ao buscar usuários:", error);
        return res.status(500).json({ error: "Erro ao buscar usuários." });
    }
});

// 🔹 Clientes só podem ver os próprios arquivos
router.get("/files", checkRole("client"), async (req, res) => {
    console.log(`📢 Rota /files foi chamada pelo usuário ${req.user._id}`);

    try {
        const files = await File.find({ uploadedBy: req.user._id });
        return res.json({ files });
    } catch (error) {
        console.error("❌ Erro ao buscar arquivos:", error);
        return res.status(500).json({ error: "Erro ao buscar arquivos." });
    }
});

// 🔹 Apenas administradores podem ver TODOS os arquivos
router.get("/admin/files", checkRole("admin"), async (req, res) => {
    console.log("📢 Rota /admin/files foi chamada!");

    try {
        const files = await File.find().populate("uploadedBy", "name email");
        return res.json({ files });
    } catch (error) {
        console.error("❌ Erro ao buscar arquivos:", error);
        return res.status(500).json({ error: "Erro ao buscar arquivos." });
    }
});

// 🔹 Rota para upload de arquivos (clientes podem enviar arquivos)
router.post("/upload", upload.single("file"), async (req, res) => {
    console.log("📢 Rota /upload foi chamada!");

    try {
        // 🔹 Pegando userId de forma correta
        const userId = req.body.userId;

        if (!userId) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        // 🔹 Pegando informações do arquivo
        const { originalname, filename, path, mimetype, size } = req.file;

        // Criar o registro no banco de dados
        const file = await File.create({
            filename: originalname,
            path,
            mimetype,
            size,
            uploadedBy: userId
        });

        return res.json({ message: "✅ Arquivo enviado com sucesso!", file });
    } catch (error) {
        console.error("❌ Erro no upload:", error);
        return res.status(500).json({ error: "Erro ao enviar arquivo" });
    }
});

// 🔹 Rota para administradores enviarem arquivos para clientes
router.post("/admin/upload", upload.single("file"), async (req, res) => {
    console.log("📢 Rota /admin/upload foi chamada!");

    try {
        const { clientId, userId } = req.body;

        if (!clientId) {
            return res.status(400).json({ error: "O ID do cliente é obrigatório." });
        }

        if (!userId) {
            return res.status(400).json({ error: "O ID do administrador é obrigatório." });
        }

        const file = new File({
            filename: req.file.filename,
            path: req.file.path,
            mimetype: req.file.mimetype,
            size: req.file.size,
            uploadedBy: userId, // ID do admin que enviou
            assignedTo: clientId, // Cliente que recebeu
        });

        await file.save();

        // 🔹 Criar a notificação no banco de dados
        const notification = new Notification({
            message: `Você recebeu um novo arquivo: ${req.file.filename}`,
            user: clientId,
        });

        await notification.save();

        console.log("🔔 Notificação enviada para o cliente:", clientId);
        return res.json({ message: "✅ Arquivo enviado e notificação criada!", file });
    } catch (error) {
        console.error("❌ Erro ao enviar arquivo:", error);
        return res.status(500).json({ error: "Erro ao enviar arquivo." });
    }
});

// 🔹 Rota para download de arquivos pelo cliente
router.get("/files/download/:fileId", async (req, res) => {
    console.log(`📢 Rota /files/download/${req.params.fileId} foi chamada!`);

    try {
        const { fileId } = req.params;
        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ error: "Arquivo não encontrado." });
        }

        const filePath = file.path;

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "O arquivo não foi encontrado no servidor." });
        }

        console.log("📂 Iniciando download:", filePath);
        return res.download(filePath, file.filename);
    } catch (error) {
        console.error("❌ Erro ao tentar baixar arquivo:", error);
        return res.status(500).json({ error: "Erro ao baixar arquivo." });
    }
});

router.get("/notifications", checkRole("client"), async (req, res) => {
    console.log(`📢 Rota /notifications chamada pelo usuário ${req.user._id}`);

    try {
        const notifications = await Notification.find({ user: req.user._id, read: false }).sort({ createdAt: -1 });

        return res.json({ notifications });
    } catch (error) {
        console.error("❌ Erro ao buscar notificações:", error);
        return res.status(500).json({ error: "Erro ao buscar notificações." });
    }
});

router.get("/notifications/:userId", async (req, res) => {
    console.log(`📢 Rota /notifications/${req.params.userId} foi chamada!`);

    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: "O ID do usuário é obrigatório." });
        }

        // 🔹 Buscar todas as notificações do usuário
        const notifications = await Notification.find({ user: userId, read: false }).sort({ createdAt: -1 });

        return res.json({ notifications });
    } catch (error) {
        console.error("❌ Erro ao buscar notificações:", error);
        return res.status(500).json({ error: "Erro ao buscar notificações." });
    }
});

module.exports = router;
