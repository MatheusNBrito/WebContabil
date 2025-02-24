const express = require("express");
const User = require("./models/User").default || require("./models/User");
const mongoose = require("mongoose"); // 🔹 Certifique-se de importar o mongoose
const upload = require("./config/multer"); // 🔹 Certifique-se de importar o multer corretamente
const File = require("./models/File");
const router = express.Router();
const fs = require("fs");
const Notification = require("./models/Notification");
const { checkRole, authenticate } = require("./middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Importa o JWT
const SECRET_KEY = "seu_segredo_super_secreto"; // Defina uma chave segura

console.log("✅ Arquivo routes.js foi carregado!");

// 🔹 Rota de Cadastro
router.post("/register", async (req, res) => {
    console.log("📢 Rota /register foi chamada!");

    try {
        const { name, email, password } = req.body;

        // 🔹 Exibir a senha digitada ANTES da criptografia
        // console.log("🔑 Senha recebida:", password);

        // 🔹 Verifica se o usuário já existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: "E-mail já cadastrado!" });
        }


        // 🔹 Criptografar a senha antes de salvar
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 🔹 Exibir a senha criptografada
        // console.log("🔐 Senha criptografada antes de salvar no MongoDB:", hashedPassword);

        // Criar usuário no banco de dados com a senha criptografada
        const user = await User.create({ name, email, password: hashedPassword, role: "client" });

        return res.status(201).json({ message: "✅ Usuário cadastrado com sucesso!", user });
    } catch (error) {
        console.error("❌ Erro ao registrar usuário:", error);
        return res.status(500).json({ error: "Erro ao registrar usuário" });
    }
});

router.post("/login", async (req, res) => {
    console.log("📢 Rota /login foi chamada!");

    try {
        const { email, password } = req.body;

        // Verificar se o usuário existe
        const user = await User.findOne({ email });
        if (!user) {
            console.error("❌ Usuário não encontrado:", email);
            return res.status(401).json({ error: "E-mail ou senha incorretos!" });
        }

        // Comparar senha fornecida com a senha criptografada no banco
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.error("❌ Senha incorreta para o usuário:", email);
            return res.status(401).json({ error: "E-mail ou senha incorretos!" });
        }

        // Criar o token JWT
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role }, // Payload do token
            SECRET_KEY, // Chave secreta
            { expiresIn: "1h" } // Tempo de expiração (1 hora)
        );

        console.log(`🔑 Usuário ${user.email} autenticado com sucesso!`);

        return res.json({ 
            message: "✅ Login bem-sucedido!", 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role 
            }, 
            token 
        });

    } catch (error) {
        console.error("❌ Erro ao fazer login:", error);
        return res.status(500).json({ error: "Erro ao fazer login." });
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
        // Buscar arquivos DESTINADOS ao cliente logado (assignedTo)
        const files = await File.find({ assignedTo: req.user._id })
            .populate("uploadedBy", "name email"); // Popula dados do admin que enviou

        return res.json({ files });
    } catch (error) {
        console.error("❌ Erro ao buscar arquivos:", error);
        return res.status(500).json({ error: "Erro ao buscar arquivos." });
    }
});

router.get("/admin/files", checkRole("admin"), async (req, res) => {
    console.log("📢 Rota /admin/files foi chamada!");

    try {
        const files = await File.find().populate({
            path: "uploadedBy",
            select: "name email",
        }).lean(); // 🔹 Converte para JSON puro

        // 🔹 Filtra arquivos sem um usuário associado
        const validFiles = files.filter(file => file.uploadedBy !== null);

        return res.json({ files: validFiles });
    } catch (error) {
        console.error("❌ Erro ao buscar arquivos:", error);
        return res.status(500).json({ error: "Erro ao buscar arquivos." });
    }
});

// 🔹 Rota para upload de arquivos (clientes podem enviar arquivos)
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        // 🔹 Temporariamente: userId é enviado pelo frontend (NÃO SEGURO!)
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "userId é obrigatório." });
        }

        // Verificar se o usuário existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        // Criar arquivo (vinculado ao userId fornecido)
        const file = await File.create({
            filename: req.file.originalname,
            path: req.file.path,
            mimetype: req.file.mimetype,
            size: req.file.size,
            uploadedBy: userId,
            assignedTo: userId, // Assume que o arquivo é para o próprio usuário
        });

        return res.json({ message: "✅ Arquivo enviado!", file });

    } catch (error) {
        console.error("Erro:", error);
        return res.status(500).json({ error: "Erro no servidor." });
    }
});

// 🔹 Rota para administradores enviarem arquivos para clientes
router.post("/admin/upload", upload.single("file"), async (req, res) => {
    try {
      const { clientId, adminId } = req.body;
  
      // Validação básica
      if (!clientId || !adminId) {
        return res.status(400).json({ error: "IDs do cliente e admin são obrigatórios." });
      }
  
      // Criar arquivo vinculado ao cliente
      const file = new File({
        filename: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedBy: adminId, // ID do admin
        assignedTo: clientId, // ID do cliente
      });
  
      await file.save();
  
      // Criar notificação para o cliente
      const notification = new Notification({
        message: `Você recebeu um novo arquivo: ${req.file.originalname}`,
        user: clientId, // Notificar o cliente
      });
  
      await notification.save();
  
      return res.json({ 
        message: "✅ Arquivo enviado com sucesso!", 
        file 
      });
  
    } catch (error) {
      console.error("Erro:", error);
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  });

  router.get("/files/client/:clientId", async (req, res) => {
    try {
      const files = await File.find({ assignedTo: req.params.clientId })
        .populate("uploadedBy", "name email"); // Informações do admin
      res.json({ files });
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar arquivos." });
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

router.delete("/files/:fileId", authenticate, async (req, res) => {
    console.log(`📢 Rota /files/${req.params.fileId} foi chamada!`);

    try {
        const { fileId } = req.params;
        const userId = req.user.id; // ID do usuário logado (do token JWT)
        const userRole = req.user.role; // Role do usuário logado

        // 🔹 Buscar o arquivo no banco de dados
        const file = await File.findById(fileId);
        if (!file) {
            return res.status(404).json({ error: "Arquivo não encontrado." });
        }

        // 🔹 Permitir exclusão apenas para quem enviou o arquivo OU para admin
        if (file.uploadedBy.toString() !== userId && userRole !== "admin") {
            return res.status(403).json({ error: "Você não tem permissão para excluir este arquivo." });
        }

        // 🔹 Remover o arquivo do servidor
        const filePath = file.path;
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log("📂 Arquivo deletado do servidor:", filePath);
        }

        // 🔹 Remover o arquivo do banco de dados
        await File.findByIdAndDelete(fileId);

        return res.json({ message: "✅ Arquivo excluído com sucesso!" });
    } catch (error) {
        console.error("❌ Erro ao excluir arquivo:", error);
        return res.status(500).json({ error: "Erro ao excluir arquivo." });
    }
});

module.exports = router;
