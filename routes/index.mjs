import express from "express";
import path from "path";
import { upload } from "../config.mjs";
import { pdfHandler, ocrHandler } from "../controllers/index.mjs";

const router = express.Router();

router.post("/upload", upload.single("file"), async (req, res, next) => {
  const fileExt = path.extname(req.file.originalname);
  console.log("file ext is : ", fileExt);
  if (fileExt === ".pdf") {
    await pdfHandler(req, res, next);
  } else {
    await ocrHandler(req, res, next);
  }
});

export default router;
