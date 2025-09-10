import PastResumesTable from "../components/PastResumesTable";

export default function HistoryPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Past Resumes</h2>
      <p className="text-sm opacity-80">Browse records and open a details modal for the full analysis.</p>
      <PastResumesTable />
    </div>
  );
}
