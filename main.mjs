// main.mjs
import express from "express";
import multer from "multer";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { createWorker } from "tesseract.js";

const app = express();

// Define __dirname for use with ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// Route for file upload
app.post("/upload", upload.single("file"), async (req, res) => {
  const filePath = path.join(__dirname, req.file.path);
  let result;

  if (path.extname(req.file.originalname).toLowerCase() === ".pdf") {
    const imgPath = filePath.replace(".pdf", ".png");
    await new Promise((resolve, reject) => {
      exec(`pdftoppm -png ${filePath} ${imgPath}`, (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve(stdout || stderr);
      });
    });

    const worker = createWorker();
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const {
      data: { text },
    } = await worker.recognize(imgPath);
    await worker.terminate();

    res.json({ text });
  } else {
    const worker = await createWorker();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const {
      data: { text },
    } = await worker.recognize(filePath);
    await worker.terminate();

    res.json({ text });
  }
});

// Starting the server
app.listen(3000, () => {
  console.log("Listening on port 3000");
});
