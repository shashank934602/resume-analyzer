import { Routes, Route, NavLink } from "react-router";
import AnalyzePage from "./pages/AnalyzePage";
import HistoryPage from "./pages/HistoryPage";

export default function App() {
  return (
    <div data-theme="cupcake" className="min-h-screen bg-gradient-to-br from-primary/10 via-base-200 to-secondary/10">
      {/* Navbar */}
      <div className="navbar bg-base-100/70 backdrop-blur-md border-b border-base-300">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="flex items-center justify-between">
            <a className="text-lg font-semibold">Resume Analyzer</a>
            <nav className="flex gap-2">
              <NavLink
                to="/analyze"
                className={({ isActive }) =>
                  `btn btn-ghost btn-sm ${isActive ? "text-primary" : "text-base-content/80"}`
                }
              >
                Analyze
              </NavLink>
              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `btn btn-ghost btn-sm ${isActive ? "text-primary" : "text-base-content/80"}`
                }
              >
                History
              </NavLink>
            </nav>
          </div>
        </div>
      </div>

      {/* Page container with subtle glass card */}
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="card bg-base-100/70 backdrop-blur-md shadow-xl ring-1 ring-base-300/30">
          <div className="card-body">
            <Routes>
              <Route path="/" element={<AnalyzePage />} />
              <Route path="/analyze" element={<AnalyzePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="*" element={<div>Not Found</div>} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}
