import { useEffect, useState } from "react";
import apiClient from "../api/client";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import FieldError from "../components/FieldError";
import { inputClass, sanitizeNameInput, validateDepartmentForm } from "../utils/validation";

const emptyForm = { Department_ID: 0, Department_Name: "", Department_Head: "" };

export default function Departments() {
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
      const res = await apiClient.get("/Department");
      setDepartments(res.data);
    } catch (err) {
      setError("Failed to load departments. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setFieldErrors({});
    setEditing(false);
    setShowModal(true);
  };

  const openEdit = (dept) => {
    setForm(dept);
    setFieldErrors({});
    setEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const { valid, errors, data } = validateDepartmentForm(form);
    if (!valid) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await apiClient.put("/Department", data);
      } else {
        await apiClient.post("/Department", data);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save department.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/Department/${deleteTarget.Department_ID}`);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete department.");
      setDeleteTarget(null);
    }
  };

  const filteredDepartments = departments.filter((d) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      d.Department_Name?.toLowerCase().includes(term) ||
      d.Department_Head?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Departments</h1>
          <p className="text-sm text-slate-500 mt-1">Manage academic departments.</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
        >
          + Add Department
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
          placeholder="Search by name or head..."
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
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Head</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : filteredDepartments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  {search ? "No departments match your search." : "No departments yet."}
                </td>
              </tr>
            ) : (
              filteredDepartments.map((d) => (
                <tr key={d.Department_ID} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">{d.Department_ID}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{d.Department_Name}</td>
                  <td className="px-4 py-3 text-slate-600">{d.Department_Head || "—"}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEdit(d)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(d)}
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
        <Modal title={editing ? "Edit Department" : "Add Department"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department Name</label>
              <input
                type="text"
                required
                value={form.Department_Name}
                onChange={(e) => setForm({ ...form, Department_Name: e.target.value })}
                className={inputClass(fieldErrors.Department_Name)}
              />
              <FieldError message={fieldErrors.Department_Name} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department Head</label>
              <input
                type="text"
                value={form.Department_Head || ""}
                onChange={(e) =>
                  setForm({ ...form, Department_Head: sanitizeNameInput(e.target.value) })
                }
                className={inputClass(fieldErrors.Department_Head)}
              />
              <FieldError message={fieldErrors.Department_Head} />
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
          message={`Delete department "${deleteTarget.Department_Name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
