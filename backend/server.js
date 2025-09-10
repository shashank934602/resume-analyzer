import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

import { debugExtract } from "./controllers/debugController.js";
import resumeRoutes from "./routes/resumeRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ESM-safe __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CORS (use env variable in production)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: FRONTEND_ORIGIN }));

// JSON parser
app.use(express.json());

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// API routes
app.post("/api/resumes/debug-extract", upload.single("resume"), debugExtract);
app.use("/api/resumes", resumeRoutes);
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Serve frontend static files
const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));

// Catch-all route for React Router SPA
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
