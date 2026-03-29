import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GlassCard } from "../components/GlassCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export function Register() {
  const { register, user } = useAuth();
  const { notify } = useToast();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
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
      await register({ username, email, password });
      notify("Account ready.");
      nav("/dashboard", { replace: true });
    } catch (err) {
      notify(err.response?.data?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 440, marginTop: "2rem" }}>
      <GlassCard style={{ padding: "1.5rem" }}>
        <h1 style={{ marginTop: 0 }}>Join the Arena</h1>
        <p style={{ color: "var(--muted)" }}>
          Already wired? <Link to="/login">Log in</Link>
        </p>
        <form onSubmit={submit} style={{ marginTop: "1rem" }}>
          <label className="label">Username</label>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={2}
            required
          />
          <label className="label" style={{ marginTop: "0.75rem" }}>
            Email
          </label>
          <input
            className="input"
            type="email"
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <button type="submit" className="btn" style={{ marginTop: "1rem", width: "100%" }} disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
