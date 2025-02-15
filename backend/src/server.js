require("dotenv").config(); // Carrega variáveis de ambiente do .env
const socketio = require("socket.io");
const app = require("./app");
const connectDatabase = require("./config/database");

const http = require("http");

const PORT = process.env.PORT || 3000;

// Criar servidor HTTP para usar com socket.io
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*", // Permitir qualquer origem (ajuste para produção)
        methods: ["GET", "POST"]
    }
});

// Conectar ao banco e iniciar servidor
connectDatabase().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
});

// Middleware para WebSockets
app.use((req, res, next) => {
    req.io = io; // Adiciona o `io` na requisição, para ser usado em qualquer rota
    next();
});

// 🔹 Configurar WebSockets
io.on("connection", (socket) => {
    console.log(`👤 Novo cliente conectado: ${socket.id}`);

    // Cliente se associa ao seu próprio ID para receber notificações
    socket.on("register", (userId) => {
        socket.join(userId);
        console.log(`🔗 Usuário ${userId} registrado no WebSocket`);
    });

    socket.on("disconnect", () => {
        console.log(`❌ Cliente desconectado: ${socket.id}`);
    });
});
