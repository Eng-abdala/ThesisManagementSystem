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

export default function StudentProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [department, setDepartment] = useState(null);
  const [thesis, setThesis] = useState(null);
  const [supervisor, setSupervisor] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [deptsRes, thesesRes, supervisorsRes, evaluationsRes] = await Promise.all([
          apiClient.get("/Department"),
          apiClient.get("/Thesis"),
          apiClient.get("/Supervisor"),
          apiClient.get("/Evaluation"),
        ]);

        const dept = deptsRes.data.find((d) => d.Department_ID === user.Department_ID);
        setDepartment(dept || null);

        const myThesis = thesesRes.data.find((t) => t.Student_ID === user.Student_ID);
        setThesis(myThesis || null);

        if (myThesis) {
          const sup = supervisorsRes.data.find((s) => s.Supervisor_ID === myThesis.Supervisor_ID);
          setSupervisor(sup || null);

          const myEvaluations = evaluationsRes.data.filter(
            (ev) => ev.Thesis_ID === myThesis.Thesis_ID
          );
          setEvaluations(myEvaluations);
        }
      } catch (err) {
        setError("Failed to load your data. Is the API running?");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Student Portal</h1>
          <p className="text-sm text-slate-500">{user.Full_Name}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
        >
          Log out
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-8 space-y-6">
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
                <dt className="text-slate-500">Student ID</dt>
                <dd className="text-slate-800 font-medium">{user.Student_ID}</dd>
                <dt className="text-slate-500">Full Name</dt>
                <dd className="text-slate-800 font-medium">{user.Full_Name}</dd>
                <dt className="text-slate-500">Email</dt>
                <dd className="text-slate-800 font-medium">{user.Email}</dd>
                <dt className="text-slate-500">Phone</dt>
                <dd className="text-slate-800 font-medium">{user.Phone || "—"}</dd>
                <dt className="text-slate-500">Department</dt>
                <dd className="text-slate-800 font-medium">{department?.Department_Name || "—"}</dd>
              </dl>
            </section>

            <section className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">My Thesis</h2>
              {thesis ? (
                <dl className="grid grid-cols-2 gap-y-3 text-sm">
                  <dt className="text-slate-500">Title</dt>
                  <dd className="text-slate-800 font-medium">{thesis.Title}</dd>
                  <dt className="text-slate-500">Status</dt>
                  <dd>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        statusStyles[thesis.Status] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {thesis.Status}
                    </span>
                  </dd>
                  <dt className="text-slate-500">Submission Date</dt>
                  <dd className="text-slate-800 font-medium">
                    {thesis.Submission_Date ? thesis.Submission_Date.slice(0, 10) : "—"}
                  </dd>
                  <dt className="text-slate-500">Supervisor</dt>
                  <dd className="text-slate-800 font-medium">{supervisor?.Full_Name || "—"}</dd>
                  <dt className="text-slate-500">Supervisor Email</dt>
                  <dd className="text-slate-800 font-medium">{supervisor?.Email || "—"}</dd>
                </dl>
              ) : (
                <p className="text-sm text-slate-400">No thesis recorded yet.</p>
              )}
            </section>

            <section className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">My Evaluations</h2>
              {evaluations.length === 0 ? (
                <p className="text-sm text-slate-400">No evaluations recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {evaluations.map((ev) => (
                    <div
                      key={ev.Evaluation_ID}
                      className="border border-slate-100 rounded-md p-3 text-sm"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-800">{ev.Examiner_Name}</span>
                        <span className="text-slate-600">Score: {ev.Score}</span>
                      </div>
                      {ev.Comments && <p className="text-slate-500 mt-1">{ev.Comments}</p>}
                      <p className="text-slate-400 text-xs mt-1">
                        {ev.Evaluation_Date ? ev.Evaluation_Date.slice(0, 10) : "—"}
                      </p>
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
