import { createWorker } from "tesseract.js";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { PdfReader } from "pdfreader";

// Define __dirname for use with ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const pdfHandler = async (req, res) => {
  let extractedText = "";
  const filePath = path.join(__dirname, "..", req.file.path);
  await new Promise((resolve, reject) => {
    new PdfReader().parseFileItems(filePath, (err, item) => {
      if (err) {
        reject(err);
        return;
      }
      if (!item || item.page) {
        resolve();
        return;
      }
      if (item.text) {
        extractedText += item.text.trim();
      }
    });
  });

  console.log("extractedText:", extractedText);
  return res.json({ extractedText });
};

export const ocrHandler = async (req, res) => {
  const filePath = path.join(__dirname, "..", req.file.path);
  const worker = await createWorker();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  const {
    data: { text },
  } = await worker.recognize(filePath);
  await worker.terminate();
  res.json({ text });
};
