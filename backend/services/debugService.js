
import PDFParser from "pdf2json";
import { ocrPdfBuffer } from "./ocrService.js";

function extractTextFromPdfBuffer_pdf2json(fileBuffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", (err) => reject(err.parserError));
    pdfParser.on("pdfParser_dataReady", () => {
      const text = pdfParser.getRawTextContent();
      resolve(text || "");
    });
    pdfParser.parseBuffer(fileBuffer);
  });
}

export async function extractTextOnly(fileBuffer) {
  
  let text = "";
  try {
    text = await extractTextFromPdfBuffer_pdf2json(fileBuffer);
  } catch (err) {
    console.warn("pdf2json extraction error:", err.message || err);
    text = "";
  }

  if (text && text.trim().length > 20) {
    return text;
  }

  
  try {
    const ocrText = await ocrPdfBuffer(fileBuffer);
    return ocrText || "";
  } catch (err) {
    console.error("OCR fallback failed:", err.message || err);
    return text; 
  }
}
