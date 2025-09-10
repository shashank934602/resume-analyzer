import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { extractTextOnly } from "./debugService.js"; // your parser + OCR

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeResume(fileBuffer) {
  if (!fileBuffer) throw new Error("No resume file provided");

  // Extract text (pdf2json first, fallback OCR)
  const resumeText = await extractTextOnly(fileBuffer);
  if (!resumeText || resumeText.trim().length < 10) {
    throw new Error("Failed to extract text from PDF (even after OCR). The PDF may be corrupted.");
  }

  // Trim to avoid token overload
  let trimmed = resumeText.replace(/\s+/g, " ").trim();
  if (trimmed.length > 8000) trimmed = trimmed.slice(0, 8000);

  // Choose model
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Prompt
  const prompt = `
You are an expert recruiter. Return ONLY valid JSON (no extra text or explanation).
Resume Text: """${trimmed}"""
JSON Format:
{
  "name": "string|null",
  "email": "string|null",
  "phone": "string|null",
  "linkedin_url": "string|null",
  "portfolio_url": "string|null",
  "summary": "string|null",
  "work_experience": [{"role":"string","company":"string","duration":"string","description":["string"]}],
  "education":[{"degree":"string","institution":"string","graduation_year":"string"}],
  "technical_skills":["string"],
  "soft_skills":["string"],
  "projects":["string"],
  "certifications":["string"],
  "resume_rating": "number (1-10)",
  "improvement_areas":"string",
  "upskill_suggestions":["string"]
}
  `;

  // Retry loop (handles 429 + 503)
  let retries = 3;
  while (retries > 0) {
    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text();

      // Clean up JSON if wrapped in ```json
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();

      return JSON.parse(text);
    } catch (err) {
      if ((err.status === 429 || err.status === 503) && retries > 1) {
        const waitMs = 15000; // wait 15s
        console.warn(`⚠️ Gemini error ${err.status}. Waiting ${waitMs/1000}s before retry...`);
        await new Promise(r => setTimeout(r, waitMs));
        retries--;
        continue;
      }

      console.error("❌ Error calling Gemini or parsing response:", err);
      throw err;
    }
  }

  throw new Error("Failed to get parsed response from Gemini after retries");
}
