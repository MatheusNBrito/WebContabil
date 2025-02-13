const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("✅ Servidor está funcionando!");
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor de Teste rodando na porta ${PORT}`);
});
