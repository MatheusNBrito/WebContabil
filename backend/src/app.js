require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());

console.log("🔄 Servidor Express carregado!");

// 🔹 Carregar as Rotas
app.use("/", routes);

module.exports = app;
