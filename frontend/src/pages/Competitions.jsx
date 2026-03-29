import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "../components/GlassCard.jsx";
import { api } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

function diffClass(d) {
  if (d === "Easy") return "tag diff-easy";
  if (d === "Hard") return "tag diff-hard";
  return "tag diff-medium";
}

export function Competitions() {
  const { notify } = useToast();
  const [q, setQ] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [q, difficulty, tag]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = { page, limit: 9 };
        if (q.trim()) params.q = q.trim();
        if (difficulty) params.difficulty = difficulty;
        if (tag.trim()) params.tag = tag.trim();
        const res = await api.get("/competitions", { params });
        if (!cancelled) setData({ items: res.data.items, total: res.data.total });
      } catch {
        if (!cancelled) notify("Could not load competitions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, q, difficulty, tag, notify]);

  const totalPages = Math.max(1, Math.ceil(data.total / 9));

  return (
    <div className="page">
      <h1 style={{ marginTop: "0.5rem" }}>Live briefings</h1>
      <p style={{ color: "var(--muted)" }}>Search, filter, and drop into any active runway.</p>

      <GlassCard style={{ padding: "1rem", marginTop: "1rem" }}>
        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            alignItems: "end",
          }}
        >
          <div>
            <label className="label">Search</label>
            <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="title, tag…" />
          </div>
          <div>
            <label className="label">Difficulty</label>
            <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="">Any</option>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          <div>
            <label className="label">Tag</label>
            <input className="input" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g. react" />
          </div>
        </div>
      </GlassCard>

      {loading ? (
        <p style={{ color: "var(--muted)", marginTop: "1.25rem" }}>Scanning frequencies…</p>
      ) : (
        <div
          style={{
            marginTop: "1.25rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1rem",
          }}
        >
          {data.items.map((c, i) => (
            <GlassCard key={c._id} delay={i * 0.03} style={{ padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{c.title}</h3>
                <span className={diffClass(c.difficulty)}>{c.difficulty}</span>
              </div>
              <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.45 }}>
                {c.description.slice(0, 140)}
                {c.description.length > 140 ? "…" : ""}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.35rem" }}>
                {(c.tags || []).map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: "0.75rem", fontSize: "0.82rem", color: "var(--muted)" }}>
                Deadline · {new Date(c.deadline).toLocaleString()}
              </div>
              <Link to={`/competitions/${c._id}`} className="btn" style={{ marginTop: "0.85rem", width: "100%" }}>
                Open briefing
              </Link>
            </GlassCard>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem", alignItems: "center" }}>
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
    </div>
  );
}
