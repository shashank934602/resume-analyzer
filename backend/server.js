import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import { debugExtract } from "./controllers/debugController.js";
import resumeRoutes from "./routes/resumeRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ESM-safe __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CORS (make this env-driven in prod)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(express.json());
app.use(cors({ origin: FRONTEND_ORIGIN }));

// Multer
const upload = multer({ storage: multer.memoryStorage() });

// API routes first
app.post("/api/resumes/debug-extract", upload.single("resume"), debugExtract);
app.use("/api/resumes", resumeRoutes);
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Serve built frontend
const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));

// ✅ Correct catch-all route for React Router
// Catch-all route for SPA (React Router)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});



app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
