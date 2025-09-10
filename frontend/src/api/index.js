const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export async function uploadResume(file) {
  const fd = new FormData();
  fd.append("resume", file); // field name must be "resume"
  const res = await fetch(`${API_BASE}/api/resumes/upload`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

export async function debugExtract(file) {
  const fd = new FormData();
  fd.append("resume", file);
  const res = await fetch(`${API_BASE}/api/resumes/debug-extract`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(`Debug failed: ${res.status}`);
  return res.json();
}

export async function listResumes() {
  const res = await fetch(`${API_BASE}/api/resumes`);
  if (!res.ok) throw new Error(`List failed: ${res.status}`);
  return res.json();
}

export async function getResume(id) {
  const res = await fetch(`${API_BASE}/api/resumes/${id}`);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}
