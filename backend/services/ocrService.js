// services/ocrService.js
import fs from "fs/promises";
import fsSync from "fs";
import os from "os";
import path from "path";
import { promisify } from "util";
import { exec } from "child_process";
import { createWorker } from "tesseract.js";

const execP = promisify(exec);

// Convert PDF buffer -> PNG pages using pdftoppm (Poppler). Returns array of PNG paths.
async function pdfBufferToPngs(buffer) {
  const tmpDir = path.join(os.tmpdir(), `pdfocr-${Date.now()}`);
  await fs.mkdir(tmpDir, { recursive: true });

  const pdfPath = path.join(tmpDir, "input.pdf");
  await fs.writeFile(pdfPath, buffer);

  // output prefix (pdftoppm appends -1, -2 etc)
  const outputPrefix = path.join(tmpDir, "page");

  // -png => output PNGs, -r 300 => 300 DPI (higher quality helps OCR)
  const cmd = `pdftoppm -png -r 300 "${pdfPath}" "${outputPrefix}"`;
  await execP(cmd);

  // collect png files created (page-1.png, page-2.png, ...)
  const files = await fs.readdir(tmpDir);
  const pngs = files
    .filter((f) => f.toLowerCase().endsWith(".png"))
    .map((f) => path.join(tmpDir, f))
    .sort();

  return { tmpDir, pngs };
}

// Run Tesseract OCR on an array of image paths. Returns concatenated text.
async function ocrImagesToText(pngPaths) {
  const worker = await createWorker('eng'); // new API: await and pass language here [1][9]
  try {
    let fullText = "";
    for (const p of pngPaths) {
      const { data } = await worker.recognize(p);
      fullText += (data?.text || "") + "\n\n";
    }
    return fullText;
  } finally {
    await worker.terminate();
  }
}

// Main helper: pdfBuffer -> OCR text (cleans up temp dir)
export async function ocrPdfBuffer(fileBuffer) {
  // Ensure pdftoppm exists
  try {
    await execP("pdftoppm -v");
  } catch (e) {
    throw new Error("pdftoppm (Poppler) not found on PATH. Install Poppler and add its bin folder to PATH.");
  }

  const { tmpDir, pngs } = await pdfBufferToPngs(fileBuffer);

  if (!pngs || pngs.length === 0) {
    // cleanup
    try { await fs.rm(tmpDir, { recursive: true, force: true }); } catch {}
    return "";
  }

  try {
    const text = await ocrImagesToText(pngs);
    return text;
  } finally {
    // remove temp folder and files
    try {
      // Node 14+ supports fs.rm
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch (err) {
      // best-effort cleanup
      for (const f of pngs) {
        try { fsSync.unlinkSync(f); } catch {}
      }
      try { fsSync.rmdirSync(path.dirname(pngs[0])); } catch {}
    }
  }
}
