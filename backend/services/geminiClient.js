// backend/services/geminiClient.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-1.5-flash-8b"; // optional

const genAI = new GoogleGenerativeAI(API_KEY);

async function callGemini(modelName, prompt) {
  const model = genAI.getGenerativeModel({ model: modelName });
  return model.generateContent(prompt);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Retries 503/429 with truncated exponential backoff + jitter
export async function generateWithRetry(prompt, { maxRetries = 5, base = 600, cap = 8000 } = {}) {
  let attempt = 0;
  let modelName = PRIMARY_MODEL;

  while (true) {
    try {
      return await callGemini(modelName, prompt);
    } catch (e) {
      const status = e?.status;
      const retriable = status === 503 || status === 429;
      if (!retriable || attempt >= maxRetries) throw e;

      // after a few 503s try fallback model
      if (status === 503 && attempt >= 2 && FALLBACK_MODEL && modelName !== FALLBACK_MODEL) {
        modelName = FALLBACK_MODEL;
      }

      const delay = Math.min(cap, Math.round((base * 2 ** attempt) * (0.5 + Math.random())));
      await sleep(delay);
      attempt += 1;
    }
  }
}
