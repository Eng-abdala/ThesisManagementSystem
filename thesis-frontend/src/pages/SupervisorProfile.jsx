import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const statusStyles = {
  "In Progress": "bg-amber-100 text-amber-700",
  Submitted: "bg-blue-100 text-blue-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function SupervisorProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [department, setDepartment] = useState(null);
  const [myTheses, setMyTheses] = useState([]);
  const [students, setStudents] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [deptsRes, thesesRes, studentsRes, evaluationsRes] = await Promise.all([
          apiClient.get("/Department"),
          apiClient.get("/Thesis"),
          apiClient.get("/Student"),
          apiClient.get("/Evaluation"),
        ]);

        const dept = deptsRes.data.find((d) => d.Department_ID === user.Department_ID);
        setDepartment(dept || null);

        const supervised = thesesRes.data.filter((t) => t.Supervisor_ID === user.Supervisor_ID);
        setMyTheses(supervised);
        setStudents(studentsRes.data);

        const thesisIds = supervised.map((t) => t.Thesis_ID);
        setEvaluations(evaluationsRes.data.filter((ev) => thesisIds.includes(ev.Thesis_ID)));
      } catch (err) {
        setError("Failed to load your data. Is the API running?");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const studentName = (id) => students.find((s) => s.Student_ID === id)?.Full_Name || `#${id}`;
  const evaluationsFor = (thesisId) => evaluations.filter((ev) => ev.Thesis_ID === thesisId);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Supervisor Portal</h1>
          <p className="text-sm text-slate-500">{user.Full_Name}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
        >
          Log out
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-8 space-y-6">
        {error && (
          <div className="px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : (
          <>
            <section className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">My Details</h2>
              <dl className="grid grid-cols-2 gap-y-3 text-sm">
                <dt className="text-slate-500">Supervisor ID</dt>
                <dd className="text-slate-800 font-medium">{user.Supervisor_ID}</dd>
                <dt className="text-slate-500">Full Name</dt>
                <dd className="text-slate-800 font-medium">{user.Full_Name}</dd>
                <dt className="text-slate-500">Email</dt>
                <dd className="text-slate-800 font-medium">{user.Email}</dd>
                <dt className="text-slate-500">Specialization</dt>
                <dd className="text-slate-800 font-medium">{user.Specialization || "—"}</dd>
                <dt className="text-slate-500">Department</dt>
                <dd className="text-slate-800 font-medium">{department?.Department_Name || "—"}</dd>
              </dl>
            </section>

            <section className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">
                Theses I Supervise ({myTheses.length})
              </h2>
              {myTheses.length === 0 ? (
                <p className="text-sm text-slate-400">No theses assigned yet.</p>
              ) : (
                <div className="space-y-4">
                  {myTheses.map((t) => (
                    <div key={t.Thesis_ID} className="border border-slate-100 rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-800">{t.Title}</span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusStyles[t.Status] || "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {t.Status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">
                        Student: <span className="text-slate-700">{studentName(t.Student_ID)}</span>
                        {" · "}
                        Submitted:{" "}
                        <span className="text-slate-700">
                          {t.Submission_Date ? t.Submission_Date.slice(0, 10) : "—"}
                        </span>
                      </p>
                      {evaluationsFor(t.Thesis_ID).length > 0 && (
                        <div className="mt-2 space-y-1">
                          {evaluationsFor(t.Thesis_ID).map((ev) => (
                            <div key={ev.Evaluation_ID} className="text-xs text-slate-500">
                              {ev.Examiner_Name} scored {ev.Score}
                              {ev.Comments ? ` — ${ev.Comments}` : ""}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
