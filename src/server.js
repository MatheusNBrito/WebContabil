require("dotenv").config(); // Carrega variáveis de ambiente do .env

const app = require("./app");
const connectDatabase = require("./config/database");

const PORT = process.env.PORT || 3000;

// Conectar ao banco e iniciar servidor
connectDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
});
