import { useEffect, useState } from "react";
import apiClient from "../api/client";

const cards = [
  { key: "departments", label: "Departments", icon: "🏛️", color: "bg-indigo-50 text-indigo-700" },
  { key: "students", label: "Students", icon: "🎓", color: "bg-blue-50 text-blue-700" },
  { key: "supervisors", label: "Supervisors", icon: "🧑‍🏫", color: "bg-purple-50 text-purple-700" },
  { key: "theses", label: "Theses", icon: "📄", color: "bg-amber-50 text-amber-700" },
  { key: "evaluations", label: "Evaluations", icon: "✅", color: "bg-green-50 text-green-700" },
];

const statusStyles = {
  "In Progress": "bg-amber-100 text-amber-700",
  Submitted: "bg-blue-100 text-blue-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function Dashboard() {
  const [counts, setCounts] = useState({
    departments: 0,
    students: 0,
    supervisors: 0,
    theses: 0,
    evaluations: 0,
  });
  const [statusBreakdown, setStatusBreakdown] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [depts, students, supervisors, theses, evaluations] = await Promise.all([
          apiClient.get("/Department"),
          apiClient.get("/Student"),
          apiClient.get("/Supervisor"),
          apiClient.get("/Thesis"),
          apiClient.get("/Evaluation"),
        ]);

        setCounts({
          departments: depts.data.length,
          students: students.data.length,
          supervisors: supervisors.data.length,
          theses: theses.data.length,
          evaluations: evaluations.data.length,
        });

        const breakdown = {};
        theses.data.forEach((t) => {
          breakdown[t.Status] = (breakdown[t.Status] || 0) + 1;
        });
        setStatusBreakdown(breakdown);
      } catch (err) {
        setError("Failed to load dashboard data. Is the API running?");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of the Thesis Management System.</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.key} className="bg-white rounded-lg border border-slate-200 p-5">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-md text-lg mb-3 ${c.color}`}>
              {c.icon}
            </div>
            <div className="text-2xl font-semibold text-slate-800">
              {loading ? "—" : counts[c.key]}
            </div>
            <div className="text-sm text-slate-500 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Thesis Status Breakdown</h2>
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : Object.keys(statusBreakdown).length === 0 ? (
          <p className="text-sm text-slate-400">No theses recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium w-28 text-center ${
                    statusStyles[status] || "bg-slate-100 text-slate-600"
                  }`}
                >
                  {status}
                </span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{
                      width: `${(count / counts.theses) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-slate-600 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
