import { useEffect, useState } from "react";
import apiClient from "../api/client";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import FieldError from "../components/FieldError";
import { inputClass, sanitizeNameInput, sanitizeScoreInput, validateEvaluationForm } from "../utils/validation";

const emptyForm = {
  Evaluation_ID: 0,
  Thesis_ID: "",
  Examiner_Name: "",
  Score: "",
  Comments: "",
  Evaluation_Date: "",
};

export default function Evaluations() {
  const [evaluations, setEvaluations] = useState([]);
  const [theses, setTheses] = useState([]);
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
      const [evalRes, thesesRes] = await Promise.all([
        apiClient.get("/Evaluation"),
        apiClient.get("/Thesis"),
      ]);
      setEvaluations(evalRes.data);
      setTheses(thesesRes.data);
    } catch (err) {
      setError("Failed to load evaluations. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const thesisTitle = (id) => theses.find((t) => t.Thesis_ID === id)?.Title || `#${id}`;

  const openCreate = () => {
    setForm({
      ...emptyForm,
      Thesis_ID: theses[0]?.Thesis_ID || "",
      Evaluation_Date: new Date().toISOString().slice(0, 10),
    });
    setFieldErrors({});
    setEditing(false);
    setShowModal(true);
  };

  const openEdit = (ev) => {
    setForm({
      ...ev,
      Evaluation_Date: ev.Evaluation_Date ? ev.Evaluation_Date.slice(0, 10) : "",
    });
    setFieldErrors({});
    setEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const { valid, errors, data } = validateEvaluationForm(form);
    if (!valid) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const payload = data;
      if (editing) {
        await apiClient.put("/Evaluation", payload);
      } else {
        await apiClient.post("/Evaluation", payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save evaluation.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/Evaluation/${deleteTarget.Evaluation_ID}`);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete evaluation.");
      setDeleteTarget(null);
    }
  };

  const filteredEvaluations = evaluations.filter((ev) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      ev.Examiner_Name?.toLowerCase().includes(term) ||
      ev.Comments?.toLowerCase().includes(term) ||
      thesisTitle(ev.Thesis_ID)?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Evaluations</h1>
          <p className="text-sm text-slate-500 mt-1">Record thesis examination results.</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
        >
          + Add Evaluation
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
          placeholder="Search by examiner, thesis, or comments..."
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
              <th className="px-4 py-3 font-medium">Thesis</th>
              <th className="px-4 py-3 font-medium">Examiner</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : filteredEvaluations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  {search ? "No evaluations match your search." : "No evaluations yet."}
                </td>
              </tr>
            ) : (
              filteredEvaluations.map((ev) => (
                <tr key={ev.Evaluation_ID} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">{ev.Evaluation_ID}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">
                    {thesisTitle(ev.Thesis_ID)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{ev.Examiner_Name}</td>
                  <td className="px-4 py-3 text-slate-600">{ev.Score}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {ev.Evaluation_Date ? ev.Evaluation_Date.slice(0, 10) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEdit(ev)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(ev)}
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
        <Modal title={editing ? "Edit Evaluation" : "Add Evaluation"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Thesis</label>
              <select
                required
                value={form.Thesis_ID}
                onChange={(e) => setForm({ ...form, Thesis_ID: e.target.value })}
                className={inputClass(fieldErrors.Thesis_ID)}
              >
                <option value="" disabled>
                  Select a thesis
                </option>
                {theses.map((t) => (
                  <option key={t.Thesis_ID} value={t.Thesis_ID}>
                    {t.Title}
                  </option>
                ))}
              </select>
              <FieldError message={fieldErrors.Thesis_ID} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Examiner Name</label>
              <input
                type="text"
                required
                value={form.Examiner_Name}
                onChange={(e) =>
                  setForm({ ...form, Examiner_Name: sanitizeNameInput(e.target.value) })
                }
                className={inputClass(fieldErrors.Examiner_Name)}
              />
              <FieldError message={fieldErrors.Examiner_Name} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Score</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                value={form.Score}
                onChange={(e) => setForm({ ...form, Score: sanitizeScoreInput(e.target.value) })}
                className={inputClass(fieldErrors.Score)}
              />
              <FieldError message={fieldErrors.Score} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Comments</label>
              <textarea
                rows={3}
                value={form.Comments || ""}
                onChange={(e) => setForm({ ...form, Comments: e.target.value })}
                className={inputClass(fieldErrors.Comments)}
              />
              <FieldError message={fieldErrors.Comments} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Evaluation Date</label>
              <input
                type="date"
                required
                value={form.Evaluation_Date || ""}
                onChange={(e) => setForm({ ...form, Evaluation_Date: e.target.value })}
                className={inputClass(fieldErrors.Evaluation_Date)}
              />
              <FieldError message={fieldErrors.Evaluation_Date} />
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
          message={`Delete evaluation by "${deleteTarget.Examiner_Name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
