import fs from "fs";
import pdfParse from "pdf-parse";

let dataBuffer = fs.readFileSync("path_to_pdf_file.pdf");

pdfParse(dataBuffer).then(function (data) {
  console.log(data.text);
});
