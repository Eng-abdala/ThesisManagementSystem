import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../auth/AuthContext";
import FieldError from "../components/FieldError";
import { inputClass, sanitizeNameInput, validateLoginForm } from "../utils/validation";

const ADMIN_NAME = "admin";
const ADMIN_EMAIL = "admin@gmail.com";

export default function Login() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const { valid, errors, data } = validateLoginForm(name, email);
    if (!valid) {
      setFieldErrors(errors);
      return;
    }

    const typedName = data.name.toLowerCase();
    const typedEmail = data.email;

    // Admin login is hardcoded, no table needed.
    if (typedName === ADMIN_NAME && typedEmail === ADMIN_EMAIL) {
      login({ role: "admin", Full_Name: "Admin" });
      navigate("/");
      return;
    }

    setLoading(true);
    try {
      const [studentsRes, supervisorsRes] = await Promise.all([
        apiClient.get("/Student"),
        apiClient.get("/Supervisor"),
      ]);

      const student = studentsRes.data.find(
        (s) =>
          s.Full_Name?.trim().toLowerCase() === typedName &&
          s.Email?.trim().toLowerCase() === typedEmail
      );
      if (student) {
        login({ role: "student", ...student });
        navigate("/student");
        return;
      }

      const supervisor = supervisorsRes.data.find(
        (s) =>
          s.Full_Name?.trim().toLowerCase() === typedName &&
          s.Email?.trim().toLowerCase() === typedEmail
      );
      if (supervisor) {
        login({ role: "supervisor", ...supervisor });
        navigate("/supervisor");
        return;
      }

      setError("No matching record found. Check your name and email and try again.");
    } catch (err) {
      setError("Could not verify login. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-lg border border-slate-200 p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">Thesis Management System</h1>
        <p className="text-sm text-slate-500 mb-6">
          Sign in with your registered name and email.
        </p>

        {error && (
          <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(sanitizeNameInput(e.target.value))}
              className={inputClass(fieldErrors.name)}
            />
            <FieldError message={fieldErrors.name} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass(fieldErrors.email)}
            />
            <FieldError message={fieldErrors.email} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
