const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Quem enviou
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Cliente que pode baixar
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("File", FileSchema);
