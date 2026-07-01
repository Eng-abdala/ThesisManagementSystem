import { useEffect, useState } from "react";
import apiClient from "../api/client";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import FieldError from "../components/FieldError";
import { inputClass, sanitizeNameInput, validateSupervisorForm } from "../utils/validation";

const emptyForm = { Supervisor_ID: 0, Full_Name: "", Email: "", Specialization: "", Department_ID: "" };

export default function Supervisors() {
  const [supervisors, setSupervisors] = useState([]);
  const [departments, setDepartments] = useState([]);
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
      const [supRes, deptRes] = await Promise.all([
        apiClient.get("/Supervisor"),
        apiClient.get("/Department"),
      ]);
      setSupervisors(supRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      setError("Failed to load supervisors. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const departmentName = (id) =>
    departments.find((d) => d.Department_ID === id)?.Department_Name || `#${id}`;

  const openCreate = () => {
    setForm({ ...emptyForm, Department_ID: departments[0]?.Department_ID || "" });
    setFieldErrors({});
    setEditing(false);
    setShowModal(true);
  };

  const openEdit = (sup) => {
    setForm(sup);
    setFieldErrors({});
    setEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const { valid, errors, data } = validateSupervisorForm(form);
    if (!valid) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const payload = data;
      if (editing) {
        await apiClient.put("/Supervisor", payload);
      } else {
        await apiClient.post("/Supervisor", payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save supervisor.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/Supervisor/${deleteTarget.Supervisor_ID}`);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete supervisor.");
      setDeleteTarget(null);
    }
  };

  const filteredSupervisors = supervisors.filter((s) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      s.Full_Name?.toLowerCase().includes(term) ||
      s.Email?.toLowerCase().includes(term) ||
      s.Specialization?.toLowerCase().includes(term) ||
      departmentName(s.Department_ID)?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Supervisors</h1>
          <p className="text-sm text-slate-500 mt-1">Manage thesis supervisors.</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
        >
          + Add Supervisor
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
          placeholder="Search by name, email, specialization, or department..."
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
              <th className="px-4 py-3 font-medium">Full Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Specialization</th>
              <th className="px-4 py-3 font-medium">Department</th>
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
            ) : filteredSupervisors.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  {search ? "No supervisors match your search." : "No supervisors yet."}
                </td>
              </tr>
            ) : (
              filteredSupervisors.map((s) => (
                <tr key={s.Supervisor_ID} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">{s.Supervisor_ID}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{s.Full_Name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.Email}</td>
                  <td className="px-4 py-3 text-slate-600">{s.Specialization || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{departmentName(s.Department_ID)}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEdit(s)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(s)}
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
        <Modal title={editing ? "Edit Supervisor" : "Add Supervisor"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={form.Full_Name}
                onChange={(e) =>
                  setForm({ ...form, Full_Name: sanitizeNameInput(e.target.value) })
                }
                className={inputClass(fieldErrors.Full_Name)}
              />
              <FieldError message={fieldErrors.Full_Name} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.Email}
                onChange={(e) => setForm({ ...form, Email: e.target.value })}
                className={inputClass(fieldErrors.Email)}
              />
              <FieldError message={fieldErrors.Email} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
              <input
                type="text"
                value={form.Specialization || ""}
                onChange={(e) => setForm({ ...form, Specialization: e.target.value })}
                className={inputClass(fieldErrors.Specialization)}
              />
              <FieldError message={fieldErrors.Specialization} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select
                required
                value={form.Department_ID}
                onChange={(e) => setForm({ ...form, Department_ID: e.target.value })}
                className={inputClass(fieldErrors.Department_ID)}
              >
                <option value="" disabled>
                  Select a department
                </option>
                {departments.map((d) => (
                  <option key={d.Department_ID} value={d.Department_ID}>
                    {d.Department_Name}
                  </option>
                ))}
              </select>
              <FieldError message={fieldErrors.Department_ID} />
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
          message={`Delete supervisor "${deleteTarget.Full_Name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
