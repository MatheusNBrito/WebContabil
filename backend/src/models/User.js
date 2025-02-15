const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["client", "admin"], default: "client" },
}, { timestamps: true });

// 🔹 Middleware para criptografar a senha antes de salvar
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // Só criptografa se a senha for alterada
    this.password = await bcrypt.hash(this.password, 10); // Gera um hash seguro com 10 rounds
    next();
});

module.exports = mongoose.model("User", UserSchema);
