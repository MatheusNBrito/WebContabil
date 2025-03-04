const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // Nome único para a empresa
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Usuário que criou a empresa
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Outros usuários vinculados (se necessário no futuro)
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Company", CompanySchema);
