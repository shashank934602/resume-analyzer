
import { extractTextOnly } from "../services/debugService.js";

export async function debugExtract(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const text = await extractTextOnly(req.file.buffer);
    return res.json({ ok: true, length: text.length, preview: text.slice(0, 3000) });
  } catch (err) {
    console.error("debugExtract error:", err);
    res.status(500).json({ error: "Failed to extract text", details: err.message });
  }
}
