const express = require("express");
const User = require("./models/User").default || require("./models/User");
const mongoose = require("mongoose"); // 🔹 Certifique-se de importar o mongoose
const upload = require("./config/multer"); // 🔹 Certifique-se de importar o multer corretamente
const File = require("./models/File");
const router = express.Router();
const fs = require("fs");
const Notification = require("./models/Notification");
const Company = require("./models/Company");
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


// 🔹 Rota para upload de arquivos (clientes podem enviar arquivos)
router.post("/upload", upload.array("files", 10), async (req, res) => {

    try {
        // 🔹 Agora o front-end deve enviar o `userId` e `companyId`
        const { userId, companyId } = req.body;

        if (!userId || !companyId) {
            return res.status(400).json({ error: "userId e companyId são obrigatórios." });
        }

        // 🔹 Verificar se o usuário existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        // 🔹 Verificar se a empresa existe
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ error: "Empresa não encontrada." });
        }

        // 🔹 Garantir que o usuário pertence à empresa (owner ou funcionário)
        if (!company.owner.equals(userId) && !company.employees.includes(userId)) {
            return res.status(403).json({ error: "Usuário não tem permissão para enviar arquivos para esta empresa." });
        }

        // 🔹 Criar o arquivo vinculado à empresa
        const uploadedFiles = req.files.map((file) => ({
            filename: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size,
            uploadedBy: userId,
            assignedTo: userId,
            company: companyId
        }));
        
        const savedFiles = await File.insertMany(uploadedFiles);
        
        return res.json({ message: "✅ Arquivos enviados com sucesso!", files: savedFiles });

    } catch (error) {
        console.error("❌ Erro ao enviar arquivo:", error);
        return res.status(500).json({ error: "Erro no servidor." });
    }
});


/**
 * 🔹 Rota para o admin enviar arquivos para uma empresa específica
 */
router.post("/admin/upload", upload.array("files", 10), checkRole("admin"), async (req, res) => {
    try {
        const { companyId } = req.body;

        console.log("📢 ID da Empresa recebida:", companyId);
        console.log("📂 Arquivos recebidos:", req.files); // 🔹 Log para depuração

        // 🔹 Validar se companyId é um ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            console.error("❌ ID da empresa inválido:", companyId);
            return res.status(400).json({ error: "ID da empresa inválido." });
        }

        // 🔹 Verificar se a empresa realmente existe
        const companyExists = await Company.findById(companyId);
        if (!companyExists) {
            console.error("❌ Empresa não encontrada no banco de dados.");
            return res.status(404).json({ error: "Empresa não encontrada." });
        }

        // 🔹 Verifica se foram enviados arquivos
        if (!req.files || req.files.length === 0) {
            console.error("❌ Nenhum arquivo foi enviado.");
            return res.status(400).json({ error: "Nenhum arquivo enviado." });
        }

        // 🔹 Criar os arquivos associados à empresa
        const uploadedFiles = req.files.map((file) => ({
            filename: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size,
            uploadedBy: req.user.id, // 🔹 ID do admin que enviou
            company: companyId, // 🔹 Associado à empresa específica
        }));

        const savedFiles = await File.insertMany(uploadedFiles);

        return res.status(201).json({ message: "✅ Arquivos enviados com sucesso!", files: savedFiles });
    } catch (error) {
        console.error("❌ Erro ao enviar arquivos:", error);
        return res.status(500).json({ error: "Erro ao enviar arquivos." });
    }
});


// 🔹 Rota para download de arquivos pelo cliente
router.get("/files/download/:fileId", authenticate, async (req, res) => {
    console.log(`📢 Rota /files/download/${req.params.fileId} foi chamada pelo usuário ${req.user?.id}`);

    try {
        const { fileId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }

        // Buscar o usuário para verificar se ele é admin
        const user = await User.findById(userId);
        const isAdmin = user?.role === "admin";

        // Buscar o arquivo no banco de dados
        const file = await File.findById(fileId).populate("company");
        if (!file) {
            return res.status(404).json({ error: "Arquivo não encontrado." });
        }

        // Se for admin, permitir o download sem verificar empresa
        if (isAdmin) {
            console.log(`✅ Usuário ${userId} é admin e tem permissão para baixar qualquer arquivo.`);
        } else {
            // Caso não seja admin, verificar se pertence à empresa do arquivo
            const company = await Company.findById(file.company._id);
            if (!company) {
                return res.status(404).json({ error: "Empresa não encontrada." });
            }

            if (!company.owner.equals(userId) && !company.employees.includes(userId)) {
                return res.status(403).json({ error: "Você não tem permissão para baixar este arquivo." });
            }
        }

        const filePath = file.path;
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "O arquivo não foi encontrado no servidor." });
        }

        console.log(`📂 Download autorizado para o arquivo: ${file.filename}`);
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
    console.log(`📢 Rota /files/${req.params.fileId} foi chamada pelo usuário ${req.user.id}`);

    try {
        const { fileId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Buscar o arquivo no banco de dados
        const file = await File.findById(fileId).populate("company");
        if (!file) {
            return res.status(404).json({ error: "Arquivo não encontrado." });
        }

        // Garantir que o usuário tem permissão para excluir o arquivo
        const company = file.company;
        const isOwner = company.owner.equals(userId);
        const isAdmin = userRole === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: "Você não tem permissão para excluir este arquivo." });
        }

        // Remover o arquivo do servidor
        const filePath = file.path;
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log("📂 Arquivo deletado do servidor:", filePath);
        }

        // Remover o arquivo do banco de dados
        await File.findByIdAndDelete(fileId);

        return res.json({ message: "✅ Arquivo excluído com sucesso!" });
    } catch (error) {
        console.error("❌ Erro ao excluir arquivo:", error);
        return res.status(500).json({ error: "Erro ao excluir arquivo." });
    }
});


// rota de logout
router.post("/logout", async (req, res) => {
    console.log("📢 Rota /logout foi chamada!");

    try {
        // 🚀 Como usamos JWT sem gerenciamento de sessão no backend,
        // basta informar ao frontend que o logout foi realizado com sucesso.
        
        return res.json({ message: "✅ Logout realizado com sucesso!" });

    } catch (error) {
        console.error("❌ Erro ao realizar logout:", error);
        return res.status(500).json({ error: "Erro ao realizar logout." });
    }
});


// 📌 Criar uma nova empresa
router.post("/companies", authenticate, async (req, res) => {
    console.log(`📢 Rota /companies foi chamada pelo usuário ${req.user.id}`);

    try {
        const { name } = req.body;
        const userId = req.user.id; // ID do usuário autenticado

        // Verifica se o nome da empresa já existe
        const existingCompany = await Company.findOne({ name });
        if (existingCompany) {
            return res.status(400).json({ error: "Empresa já cadastrada!" });
        }

        // Criar nova empresa vinculada ao usuário
        const company = await Company.create({
            name,
            owner: userId,
            employees: [userId], // O dono entra automaticamente como funcionário
        });

        console.log(`✅ Empresa criada com sucesso: ${company.name}`);

        return res.status(201).json({ message: "Empresa criada com sucesso!", company });
    } catch (error) {
        console.error("❌ Erro ao criar empresa:", error);
        return res.status(500).json({ error: "Erro ao criar empresa." });
    }
});

router.get("/companies", authenticate, async (req, res) => {
    console.log(`📢 Rota /companies foi chamada pelo usuário ${req.user.id}`);

    try {
        const userId = req.user.id;

        // Buscar empresas onde o usuário é o dono ou está listado como funcionário
        const companies = await Company.find({
            $or: [{ owner: userId }, { employees: userId }]
        });

        return res.json({ companies });
    } catch (error) {
        console.error("❌ Erro ao listar empresas:", error);
        return res.status(500).json({ error: "Erro ao listar empresas." });
    }
});

router.get("/files/:companyId", authenticate, async (req, res) => {
    console.log(`📢 Rota /files/${req.params.companyId} chamada pelo usuário ${req.user.id}`);

    try {
        const { companyId } = req.params;
        const userId = req.user.id;

        // 🔹 Verificar se a empresa existe
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ error: "Empresa não encontrada." });
        }

        // 🔹 Garantir que o usuário pertence à empresa (owner ou funcionário)
        if (!company.owner.equals(userId) && !company.employees.includes(userId)) {
            return res.status(403).json({ error: "Usuário não tem permissão para visualizar arquivos desta empresa." });
        }

        // 🔹 Buscar arquivos associados à empresa
        const files = await File.find({ company: companyId })
            .populate("uploadedBy", "name email role") // Popula detalhes do usuário que enviou o arquivo
            .sort({ createdAt: -1 }); // Ordena do mais recente para o mais antigo

        return res.json({ files });
    } catch (error) {
        console.error("❌ Erro ao buscar arquivos:", error);
        return res.status(500).json({ error: "Erro no servidor." });
    }
});

/**
 * 🔹 Rota para listar todas as empresas associadas a um cliente específico
 */
router.get("/admin/client/:clientId/companies", checkRole("admin"), async (req, res) => {
    try {
        const { clientId } = req.params;

        // 🔹 Validar se clientId é um ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ error: "ID do cliente inválido." });
        }

        // 🔹 Buscar empresas vinculadas ao cliente
        const companies = await Company.find({ owner: new mongoose.Types.ObjectId(clientId) });

        if (!companies.length) {
            return res.status(404).json({ error: "Nenhuma empresa encontrada para este cliente." });
        }

        return res.json({ companies });
    } catch (error) {
        console.error("❌ Erro ao buscar empresas do cliente:", error);
        return res.status(500).json({ error: "Erro ao buscar empresas do cliente." });
    }
});

/**
 * 🔹 Rota para listar todos os arquivos de uma empresa específica
 */
router.get("/admin/company/:companyId/files", checkRole("admin"), async (req, res) => {
    try {
        const { companyId } = req.params;

        console.log("📢 ID da Empresa recebida:", companyId); // 🔹 Log para depuração

        // 🔹 Validar se companyId é um ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            console.error("❌ ID inválido recebido:", companyId);
            return res.status(400).json({ error: "ID da empresa inválido." });
        }

        // 🔹 Verificar se a empresa realmente existe
        const companyExists = await Company.findById(companyId);
        if (!companyExists) {
            console.error("❌ Empresa não encontrada no banco de dados.");
            return res.status(404).json({ error: "Empresa não encontrada." });
        }

        // 🔹 Buscar arquivos vinculados à empresa
        const files = await File.find({ company: companyId });

        if (!files.length) {
            return res.status(404).json({ error: "Nenhum arquivo encontrado para esta empresa." });
        }

        return res.json({ files });
    } catch (error) {
        console.error("❌ Erro ao buscar arquivos da empresa:", error);
        return res.status(500).json({ error: "Erro ao buscar arquivos da empresa." });
    }
});

// 🔹 Rota para atualizar o e-mail do usuário
router.patch("/update-email", authenticate, async (req, res) => {
    console.log(`📢 Rota /update-email chamada pelo usuário ${req.user.id}`);

    try {
        const { newEmail, password } = req.body;
        const userId = req.user.id;

        // Validar entrada
        if (!newEmail || !password) {
            return res.status(400).json({ error: "Novo e-mail e senha são obrigatórios." });
        }

        // Verificar se o novo e-mail já está em uso
        const emailExists = await User.findOne({ email: newEmail });
        if (emailExists) {
            return res.status(400).json({ error: "E-mail já está em uso." });
        }

        // Buscar o usuário
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        // Verificar a senha atual
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Senha incorreta." });
        }

        // Atualizar e-mail no banco de dados
        user.email = newEmail;
        await user.save();

        console.log(`✅ E-mail do usuário ${userId} atualizado para ${newEmail}`);
        return res.json({ message: "✅ E-mail atualizado com sucesso!" });

    } catch (error) {
        console.error("❌ Erro ao atualizar e-mail:", error);
        return res.status(500).json({ error: "Erro ao atualizar e-mail." });
    }
});

// 🔹 Rota para atualizar a senha do usuário
router.patch("/update-password", authenticate, async (req, res) => {
    console.log(`📢 Rota /update-password chamada pelo usuário ${req.user.id}`);

    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Validar entrada
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "Senha atual e nova senha são obrigatórias." });
        }

        // Buscar o usuário
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        // Verificar a senha atual
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Senha atual incorreta." });
        }

        // Criptografar a nova senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Atualizar senha no banco de dados
        user.password = hashedPassword;
        await user.save();

        console.log(`✅ Senha do usuário ${userId} atualizada com sucesso.`);
        return res.json({ message: "✅ Senha atualizada com sucesso!" });

    } catch (error) {
        console.error("❌ Erro ao atualizar senha:", error);
        return res.status(500).json({ error: "Erro ao atualizar senha." });
    }
});


module.exports = router;
