import pool from "../db/index.js";
import { analyzeResume } from "../services/analysisService.js";

export async function uploadResume(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const analysis = await analyzeResume(req.file.buffer);

    const query = `
      INSERT INTO resumes
      (file_name, name, email, phone, linkedin_url, portfolio_url, summary, work_experience, education, technical_skills, soft_skills, projects, certifications, resume_rating, improvement_areas, upskill_suggestions)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *;
    `;

    const values = [
      req.file.originalname,
      analysis.name,
      analysis.email,
      analysis.phone,
      analysis.linkedin_url,
      analysis.portfolio_url,
      analysis.summary,
      JSON.stringify(analysis.work_experience),
      JSON.stringify(analysis.education),
      JSON.stringify(analysis.technical_skills),
      JSON.stringify(analysis.soft_skills),
      JSON.stringify(analysis.projects),
      JSON.stringify(analysis.certifications),
      analysis.resume_rating,
      analysis.improvement_areas,
      JSON.stringify(analysis.upskill_suggestions),
    ];

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process resume" });
  }
}

export async function getAllResumes(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, file_name, uploaded_at, name, email, resume_rating FROM resumes ORDER BY uploaded_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch resumes" });
  }
}

export async function getResumeById(req, res) {
  try {
    const result = await pool.query("SELECT * FROM resumes WHERE id=$1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch resume" });
  }
}
