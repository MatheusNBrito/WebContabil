const mongoose = require("mongoose");

async function connectDatabase() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("❌ ERRO: A variável MONGO_URI não está definida no .env");
        }

        console.log("📡 Conectando ao MongoDB:", process.env.MONGO_URI);

        await mongoose.connect(process.env.MONGO_URI); // 🔹 Agora sem opções obsoletas

        console.log("✅ Conectado ao MongoDB");
    } catch (error) {
        console.error("❌ Erro ao conectar ao MongoDB:", error.message);
        process.exit(1); // Encerra o processo em caso de erro
    }
}

module.exports = connectDatabase;
