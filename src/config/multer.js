const multer = require("multer");
const path = require("path");

// Configuração do armazenamento de arquivos
const storage = multer.diskStorage({
    destination: path.resolve(__dirname, "..", "..", "uploads"),
    filename: (req, file, cb) => {
        const filename = `${Date.now()}-${file.originalname}`;
        cb(null, filename);
    }
});

const upload = multer({ storage });

module.exports = upload;
