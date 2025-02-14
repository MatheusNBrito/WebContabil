const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    message: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    read: { type: Boolean, default: false }, // Indica se a notificação foi lida
}, { timestamps: true }); // Criado em / atualizado em

module.exports = mongoose.model("Notification", NotificationSchema);
