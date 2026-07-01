import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Departments from "./pages/Departments";
import Students from "./pages/Students";
import Supervisors from "./pages/Supervisors";
import Theses from "./pages/Theses";
import Evaluations from "./pages/Evaluations";
import StudentProfile from "./pages/StudentProfile";
import SupervisorProfile from "./pages/SupervisorProfile";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute role="admin">
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="departments" element={<Departments />} />
            <Route path="students" element={<Students />} />
            <Route path="supervisors" element={<Supervisors />} />
            <Route path="theses" element={<Theses />} />
            <Route path="evaluations" element={<Evaluations />} />
          </Route>

          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supervisor"
            element={
              <ProtectedRoute role="supervisor">
                <SupervisorProfile />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
