import { useState } from "react";
import { uploadResume, debugExtract } from "../api";

export default function ResumeUploader() {
  const [file, setFile] = useState(null);
  const [debug, setDebug] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onFile = (e) => setFile(e.target.files?.[0] || null);

  const runDebug = async () => {
    if (!file) return;
    setBusy(true); setError("");
    try { setDebug(await debugExtract(file)); } 
    catch (e) { setError(e.message); } 
    finally { setBusy(false); }
  };

  const runUpload = async () => {
    if (!file) return;
    setBusy(true); setError("");
    try { setResult(await uploadResume(file)); } 
    catch (e) { setError(e.message); } 
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept="application/pdf"
          onChange={onFile}
          className="file-input file-input-bordered file-input-primary w-full max-w-xs"
        />
        <button
          onClick={runDebug}
          disabled={!file || busy}
          className="btn"
        >
          {busy ? <span className="loading loading-spinner loading-sm"></span> : "Debug extract"}
        </button>
        <button
          onClick={runUpload}
          disabled={!file || busy}
          className="btn btn-primary"
        >
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <span className="loading loading-spinner loading-sm"></span>
              Analyzing...
            </span>
          ) : ("Analyze & save")}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {result && <AnalysisCard data={result} />}

      {debug && !result && (
        <div className="card bg-base-100">
          <div className="card-body">
            <h3 className="card-title text-sm">Debug extraction (text-only)</h3>
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(debug, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ children }) {
  return <span className="badge badge-ghost mr-2 mb-2">{children}</span>;
}

function AnalysisCard({ data }) {
  const {
    name, email, phone, linkedin_url, portfolio_url, summary,
    work_experience = [], education = [],
    technical_skills = [], soft_skills = [],
    projects = [], certifications = [],
    resume_rating, improvement_areas, upskill_suggestions = []
  } = data || {};

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold">{name || "—"}</h3>
              <div className="mt-1 flex flex-wrap gap-4 text-sm">
                <span>{email || "—"}</span>
                <span>{phone || "—"}</span>
                {linkedin_url && <a href={linkedin_url} target="_blank" rel="noreferrer" className="link link-primary">LinkedIn</a>}
                {portfolio_url && <a href={portfolio_url} target="_blank" rel="noreferrer" className="link link-primary">Portfolio</a>}
              </div>
            </div>
            <div className="badge badge-primary badge-lg">Rating: {resume_rating ?? "—"}/10</div>
          </div>
          <p className="mt-2">{summary || "—"}</p>
        </div>
      </div>

      {/* Experience / Education */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h4 className="card-title text-sm">Work Experience</h4>
            <div className="space-y-3">
              {work_experience.length === 0 && <div className="text-sm opacity-60">—</div>}
              {work_experience.map((w, i) => (
                <div key={i} className="bg-base-200 rounded-lg p-3">
                  <div className="font-medium">{w.role} · {w.company}</div>
                  <div className="text-xs opacity-70">{w.duration}</div>
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    {(w.description || []).map((d, j) => <li key={j}>{d}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h4 className="card-title text-sm">Education</h4>
            <div className="space-y-3">
              {education.length === 0 && <div className="text-sm opacity-60">—</div>}
              {education.map((e, i) => (
                <div key={i} className="bg-base-200 rounded-lg p-3">
                  <div className="font-medium">{e.degree}</div>
                  <div className="text-sm">{e.institution}</div>
                  <div className="text-xs opacity-70">Year: {e.graduation_year || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h4 className="card-title text-sm">Technical Skills</h4>
            <div className="flex flex-wrap">
              {technical_skills.length === 0 && <div className="text-sm opacity-60">—</div>}
              {technical_skills.map((s, i) => <Badge key={i}>{s}</Badge>)}
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h4 className="card-title text-sm">Soft Skills</h4>
            <div className="flex flex-wrap">
              {soft_skills.length === 0 && <div className="text-sm opacity-60">—</div>}
              {soft_skills.map((s, i) => <Badge key={i}>{s}</Badge>)}
            </div>
          </div>
        </div>
      </div>

      {/* Projects / Certifications */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h4 className="card-title text-sm">Projects</h4>
            <ul className="list-disc pl-5 text-sm">
              {projects.length === 0 && <div className="text-sm opacity-60">—</div>}
              {projects.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h4 className="card-title text-sm">Certifications</h4>
            <ul className="list-disc pl-5 text-sm">
              {certifications.length === 0 && <div className="text-sm opacity-60">—</div>}
              {certifications.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* Improvements */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h4 className="card-title text-sm">Improvement Areas</h4>
          <p className="text-sm">{improvement_areas || "—"}</p>
          <h4 className="card-title text-sm mt-3">Upskill Suggestions</h4>
          <ul className="list-disc pl-5 text-sm">
            {upskill_suggestions.length === 0 && <div className="text-sm opacity-60">—</div>}
            {upskill_suggestions.map((u, i) => <li key={i}>{u}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
