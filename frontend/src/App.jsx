import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { Home } from "./pages/Home.jsx";
import { Login } from "./pages/Login.jsx";
import { Register } from "./pages/Register.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { Competitions } from "./pages/Competitions.jsx";
import { CompetitionDetail } from "./pages/CompetitionDetail.jsx";
import { Leaderboard } from "./pages/Leaderboard.jsx";
import { Profile } from "./pages/Profile.jsx";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="page">
        <p style={{ color: "var(--muted)" }}>Authenticating session…</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/competitions/:id" element={<CompetitionDetail />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
