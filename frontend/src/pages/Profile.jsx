import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GlassCard } from "../components/GlassCard.jsx";
import { BadgeDisplay } from "../components/BadgeDisplay.jsx";
import { api } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

export function Profile() {
  const { id } = useParams();
  const { notify } = useToast();
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/users/${id}/profile`);
        if (!cancelled) setData(res.data);
      } catch {
        if (!cancelled) notify("Profile not found");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, notify]);

  if (!data) {
    return (
      <div className="page">
        <p style={{ color: "var(--muted)" }}>Resolving operator…</p>
      </div>
    );
  }

  const { user, history } = data;

  return (
    <div className="page">
      <GlassCard style={{ padding: "1.35rem", marginTop: "0.75rem" }}>
        <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.username}
              style={{
                width: 92,
                height: 92,
                borderRadius: "20px",
                objectFit: "cover",
                border: "1px solid var(--border)",
                boxShadow: "0 0 24px rgba(57,255,182,0.15)",
              }}
            />
          ) : (
            <div
              style={{
                width: 92,
                height: 92,
                borderRadius: "20px",
                background: "rgba(124,92,255,0.15)",
                border: "1px solid rgba(124,92,255,0.35)",
              }}
            />
          )}
          <div style={{ flex: "1 1 220px" }}>
            <h1 style={{ margin: 0 }}>@{user.username}</h1>
            <p style={{ color: "var(--muted)", margin: "0.35rem 0" }}>
              {user.role === "admin" ? "Administrator" : "Competitor"}
              {user.rank != null && (
                <>
                  {" "}
                  · Rank <strong>#{user.rank}</strong>
                </>
              )}
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "1.2rem", margin: 0 }}>
              {user.totalScore} <span style={{ color: "var(--muted)", fontSize: "0.95rem" }}>pts</span>
            </p>
          </div>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ marginBottom: "0.35rem" }}>Badges</h3>
          <BadgeDisplay badges={user.badges || []} showEmpty />
        </div>
      </GlassCard>

      <GlassCard style={{ padding: "1.25rem", marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Competition history</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th style={{ padding: "0.4rem" }}>Competition</th>
                <th>Score</th>
                <th>Submitted</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {(history || []).map((h) => (
                <tr key={h._id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <td style={{ padding: "0.5rem 0.35rem" }}>
                    <Link to={`/competitions/${h.competition?._id}`}>{h.competition?.title}</Link>
                    <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                      {h.competition?.difficulty} · {new Date(h.competition?.deadline).toLocaleDateString()}
                    </div>
                  </td>
                  <td>{h.score}</td>
                  <td>{new Date(h.submittedAt).toLocaleString()}</td>
                  <td>
                    <a href={h.hostedLink} target="_blank" rel="noreferrer">
                      open
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!history?.length && (
            <p style={{ color: "var(--muted)" }}>No runs logged yet.</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
