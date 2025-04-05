const multer = require("multer");
const path = require("path");
const { exec } = require("child_process");

// 🛠 Configure File Upload
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// 📌 File Upload API
const uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = `./uploads/${req.file.filename}`;
    const mobilePath = `/sdcard/Download/${req.file.filename}`;

    // ✅ Push file to mobile via ADB
    exec(`adb push ${filePath} ${mobilePath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ ADB Error: ${stderr}`);
            return res.status(500).json({ error: "File upload failed to mobile device." });
        }

        console.log(`✅ File transferred to mobile: ${mobilePath}`);
        res.json({ message: "File uploaded successfully", mobilePath });
    });
};

module.exports = { upload, uploadFile };
