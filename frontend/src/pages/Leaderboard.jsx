import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "../components/GlassCard.jsx";
import { BadgeDisplay } from "../components/BadgeDisplay.jsx";
import { api } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

export function Leaderboard() {
  const { notify } = useToast();
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ entries: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/users/leaderboard", { params: { page, limit: 15 } });
        if (!cancelled) setData({ entries: res.data.entries, total: res.data.total });
      } catch {
        if (!cancelled) notify("Could not load leaderboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, notify]);

  const totalPages = Math.max(1, Math.ceil(data.total / 15));

  return (
    <div className="page">
      <h1 style={{ marginTop: "0.5rem" }}>Global neon board</h1>
      <p style={{ color: "var(--muted)" }}>
        Sorted by career points. Tie-breakers favor longer-standing operators.
      </p>

      <GlassCard style={{ padding: "1rem", marginTop: "1rem" }}>
        {loading ? (
          <p style={{ color: "var(--muted)" }}>Crunching ranks…</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92rem" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                  <th style={{ padding: "0.45rem" }}>#</th>
                  <th>Operator</th>
                  <th>Score</th>
                  <th>Badges</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((row) => (
                  <tr key={row.userId} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <td style={{ padding: "0.55rem 0.4rem", fontWeight: 700 }}>{row.rank}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        {row.profileImage ? (
                          <img
                            src={row.profileImage}
                            alt=""
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "1px solid var(--border)",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background: "rgba(57,255,182,0.12)",
                              border: "1px solid var(--border)",
                            }}
                          />
                        )}
                        <Link to={`/profile/${row.userId}`} style={{ fontWeight: 600 }}>
                          @{row.username}
                        </Link>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{row.totalScore}</td>
                    <td>
                      <BadgeDisplay badges={row.badges || []} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", alignItems: "center" }}>
            <button type="button" className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>
            <span style={{ color: "var(--muted)" }}>
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
