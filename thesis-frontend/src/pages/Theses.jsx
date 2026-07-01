import { useEffect, useState } from "react";
import apiClient from "../api/client";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import FieldError from "../components/FieldError";
import { inputClass, validateThesisForm } from "../utils/validation";

const STATUS_OPTIONS = ["In Progress", "Submitted", "Approved", "Rejected"];

const emptyForm = {
  Thesis_ID: 0,
  Title: "",
  Student_ID: "",
  Supervisor_ID: "",
  Status: "In Progress",
  Submission_Date: "",
};

const statusStyles = {
  "In Progress": "bg-amber-100 text-amber-700",
  Submitted: "bg-blue-100 text-blue-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
        statusStyles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

export default function Theses() {
  const [theses, setTheses] = useState([]);
  const [students, setStudents] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [thesesRes, studentsRes, supervisorsRes] = await Promise.all([
        apiClient.get("/Thesis"),
        apiClient.get("/Student"),
        apiClient.get("/Supervisor"),
      ]);
      setTheses(thesesRes.data);
      setStudents(studentsRes.data);
      setSupervisors(supervisorsRes.data);
    } catch (err) {
      setError("Failed to load theses. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const studentName = (id) => students.find((s) => s.Student_ID === id)?.Full_Name || `#${id}`;
  const supervisorName = (id) => supervisors.find((s) => s.Supervisor_ID === id)?.Full_Name || `#${id}`;

  const openCreate = () => {
    setForm({
      ...emptyForm,
      Student_ID: students[0]?.Student_ID || "",
      Supervisor_ID: supervisors[0]?.Supervisor_ID || "",
    });
    setFieldErrors({});
    setEditing(false);
    setShowModal(true);
  };

  const openEdit = (thesis) => {
    setForm({
      ...thesis,
      Submission_Date: thesis.Submission_Date ? thesis.Submission_Date.slice(0, 10) : "",
    });
    setFieldErrors({});
    setEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const { valid, errors, data } = validateThesisForm(form);
    if (!valid) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const payload = data;
      if (editing) {
        await apiClient.put("/Thesis", payload);
      } else {
        await apiClient.post("/Thesis", payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save thesis.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/Thesis/${deleteTarget.Thesis_ID}`);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete thesis.");
      setDeleteTarget(null);
    }
  };

  const filteredTheses = theses.filter((t) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      t.Title?.toLowerCase().includes(term) ||
      t.Status?.toLowerCase().includes(term) ||
      studentName(t.Student_ID)?.toLowerCase().includes(term) ||
      supervisorName(t.Supervisor_ID)?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Theses</h1>
          <p className="text-sm text-slate-500 mt-1">Track thesis submissions and progress.</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
        >
          + Add Thesis
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by title, student, supervisor, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Supervisor</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : filteredTheses.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  {search ? "No theses match your search." : "No theses yet."}
                </td>
              </tr>
            ) : (
              filteredTheses.map((t) => (
                <tr key={t.Thesis_ID} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">{t.Thesis_ID}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">{t.Title}</td>
                  <td className="px-4 py-3 text-slate-600">{studentName(t.Student_ID)}</td>
                  <td className="px-4 py-3 text-slate-600">{supervisorName(t.Supervisor_ID)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.Status} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {t.Submission_Date ? t.Submission_Date.slice(0, 10) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEdit(t)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(t)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing ? "Edit Thesis" : "Add Thesis"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={form.Title}
                onChange={(e) => setForm({ ...form, Title: e.target.value })}
                className={inputClass(fieldErrors.Title)}
              />
              <FieldError message={fieldErrors.Title} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Student</label>
              <select
                required
                value={form.Student_ID}
                onChange={(e) => setForm({ ...form, Student_ID: e.target.value })}
                className={inputClass(fieldErrors.Student_ID)}
              >
                <option value="" disabled>
                  Select a student
                </option>
                {students.map((s) => (
                  <option key={s.Student_ID} value={s.Student_ID}>
                    {s.Full_Name}
                  </option>
                ))}
              </select>
              <FieldError message={fieldErrors.Student_ID} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Supervisor</label>
              <select
                required
                value={form.Supervisor_ID}
                onChange={(e) => setForm({ ...form, Supervisor_ID: e.target.value })}
                className={inputClass(fieldErrors.Supervisor_ID)}
              >
                <option value="" disabled>
                  Select a supervisor
                </option>
                {supervisors.map((s) => (
                  <option key={s.Supervisor_ID} value={s.Supervisor_ID}>
                    {s.Full_Name}
                  </option>
                ))}
              </select>
              <FieldError message={fieldErrors.Supervisor_ID} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={form.Status}
                onChange={(e) => setForm({ ...form, Status: e.target.value })}
                className={inputClass(false)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Submission Date</label>
              <input
                type="date"
                value={form.Submission_Date || ""}
                onChange={(e) => setForm({ ...form, Submission_Date: e.target.value })}
                className={inputClass(fieldErrors.Submission_Date)}
              />
              <FieldError message={fieldErrors.Submission_Date} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete thesis "${deleteTarget.Title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
