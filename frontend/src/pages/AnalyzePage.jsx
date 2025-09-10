import ResumeUploader from "../components/ResumeUploader";

export default function AnalyzePage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Analyze a PDF Resume</h2>
      <p className="text-sm opacity-80">
        Upload a resume to extract key fields, rating, improvement areas, and upskilling suggestions.
      </p>
      <ResumeUploader />
    </div>
  );
}
