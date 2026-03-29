import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GlassCard } from "../components/GlassCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export function Login() {
  const { login, user } = useAuth();
  const { notify } = useToast();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) nav("/dashboard", { replace: true });
  }, [user, nav]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      nav("/dashboard", { replace: true });
    } catch (err) {
      notify(err.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 440, marginTop: "2rem" }}>
      <GlassCard style={{ padding: "1.5rem" }}>
        <h1 style={{ marginTop: 0 }}>Authenticate</h1>
        <p style={{ color: "var(--muted)" }}>
          New here? <Link to="/register">Create an operator profile</Link>
        </p>
        <form onSubmit={submit} style={{ marginTop: "1rem" }}>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="label" style={{ marginTop: "0.75rem" }}>
            Password
          </label>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn" style={{ marginTop: "1rem", width: "100%" }} disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
