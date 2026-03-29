import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GlassCard } from "../components/GlassCard.jsx";
import { CommentSection } from "../components/CommentSection.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api, handleBadgeNotifications } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

function diffClass(d) {
  if (d === "Easy") return "tag diff-easy";
  if (d === "Hard") return "tag diff-hard";
  return "tag diff-medium";
}

export function CompetitionDetail() {
  const { id } = useParams();
  const { user, isAdmin, refreshMe } = useAuth();
  const { notify, badgeUnlocked } = useToast();
  const [competition, setCompetition] = useState(null);
  const [mySubmission, setMySubmission] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [cd, lb] = await Promise.all([
        api.get(`/competitions/${id}`),
        api.get(`/submissions/competition/${id}/leaderboard`),
      ]);
      setCompetition(cd.data.competition);
      setMySubmission(cd.data.mySubmission);
      setLeaderboard(lb.data.leaderboard || []);
    } catch {
      notify("Competition not available");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    if (!user) return notify("Log in to submit");
    try {
      const { data } = await api.post(`/submissions/competition/${id}`, { hostedLink: link });
      handleBadgeNotifications(data, badgeUnlocked);
      if (data.badgeNotifications?.length) await refreshMe();
      setMySubmission(data.submission);
      setLink("");
      notify("Submission locked in");
      load();
    } catch (err) {
      notify(err.response?.data?.message || "Submit failed");
    }
  };

  const likeSubmission = async (submissionId) => {
    if (!user) return notify("Log in to like");
    try {
      const { data } = await api.post(`/submissions/${submissionId}/like`);
      handleBadgeNotifications(data, badgeUnlocked);
      if (data.badgeNotifications?.length) await refreshMe();
      load();
    } catch {
      notify("Like failed");
    }
  };

  const saveScore = async (submissionId) => {
    const raw = scores[submissionId];
    const score = Number(raw);
    if (Number.isNaN(score) || score < 0) return notify("Invalid score");
    try {
      const { data } = await api.patch(`/submissions/${submissionId}/score`, { score });
      handleBadgeNotifications(data, badgeUnlocked);
      notify("Score saved");
      load();
    } catch {
      notify("Score update failed");
    }
  };

  if (loading || !competition) {
    return (
      <div className="page">
        <p style={{ color: "var(--muted)" }}>Loading briefing…</p>
      </div>
    );
  }

  const past = new Date(competition.deadline) < new Date();

  return (
    <div className="page">
      <Link to="/competitions" style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
        ← Back to competitions
      </Link>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", marginTop: "0.75rem" }}>
        <h1 style={{ margin: 0, flex: "1 1 200px" }}>{competition.title}</h1>
        <span className={diffClass(competition.difficulty)}>{competition.difficulty}</span>
        {past && <span className="tag" style={{ borderColor: "rgba(255,92,122,0.45)", color: "var(--danger)" }}>Closed</span>}
      </div>
      <p style={{ color: "var(--muted)" }}>
        Curated by @{competition.createdBy?.username} · Deadline {new Date(competition.deadline).toLocaleString()}
      </p>

      <div className="grid-2" style={{ marginTop: "1rem" }}>
        <GlassCard style={{ padding: "1.15rem" }}>
          <h3 style={{ marginTop: 0 }}>Brief</h3>
          <p style={{ lineHeight: 1.6 }}>{competition.description}</p>
        </GlassCard>
        <GlassCard style={{ padding: "1.15rem" }}>
          <h3 style={{ marginTop: 0 }}>Rules of engagement</h3>
          <p style={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{competition.rules}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.5rem" }}>
            {(competition.tags || []).map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard style={{ padding: "1.15rem", marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Hosted solution</h3>
        {!user && <p style={{ color: "var(--muted)" }}>Log in to submit your link.</p>}
        {user && mySubmission && (
          <p className="mono" style={{ wordBreak: "break-all" }}>
            Submitted:{" "}
            <a href={mySubmission.hostedLink} target="_blank" rel="noreferrer">
              {mySubmission.hostedLink}
            </a>
          </p>
        )}
        {user && !mySubmission && (
          <form onSubmit={submit}>
            <label className="label">Deploy URL</label>
            <input
              className="input"
              type="url"
              required
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://your-build.example.com"
            />
            <button type="submit" className="btn" style={{ marginTop: "0.65rem" }} disabled={past}>
              {past ? "Deadline passed" : "Transmit build"}
            </button>
          </form>
        )}
      </GlassCard>

      <GlassCard style={{ padding: "1.15rem", marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Leaderboard</h3>
        <p style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
          Ranking blends score, earlier submits, and likes on the entry.
        </p>
        <div style={{ overflowX: "auto", marginTop: "0.75rem" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th style={{ padding: "0.4rem" }}>#</th>
                <th>Operator</th>
                <th>Score</th>
                <th>Likes</th>
                <th>Submitted</th>
                <th>Link</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row) => (
                <tr key={row._id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <td style={{ padding: "0.45rem 0.35rem" }}>{row.rank}</td>
                  <td>
                    <Link to={`/profile/${row.user?._id}`}>@{row.user?.username}</Link>
                  </td>
                  <td>{row.score}</td>
                  <td>{row.likeCount}</td>
                  <td>{new Date(row.submittedAt).toLocaleString()}</td>
                  <td>
                    <a href={row.hostedLink} target="_blank" rel="noreferrer">
                      open
                    </a>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ padding: "0.35rem 0.55rem", fontSize: "0.78rem" }}
                      onClick={() => likeSubmission(row._id)}
                    >
                      ♥
                    </button>
                    {isAdmin && (
                      <span style={{ display: "inline-flex", gap: "0.35rem", alignItems: "center", marginLeft: "0.35rem" }}>
                        <input
                          className="input"
                          style={{ width: 72, padding: "0.35rem", fontSize: "0.8rem" }}
                          placeholder="pts"
                          value={scores[row._id] ?? ""}
                          onChange={(e) =>
                            setScores((s) => ({ ...s, [row._id]: e.target.value }))
                          }
                        />
                        <button
                          type="button"
                          className="btn"
                          style={{ padding: "0.35rem 0.5rem", fontSize: "0.78rem" }}
                          onClick={() => saveScore(row._id)}
                        >
                          Set
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!leaderboard.length && (
            <p style={{ color: "var(--muted)" }}>No signals yet — prime the board.</p>
          )}
        </div>
      </GlassCard>

      <GlassCard style={{ padding: "1.15rem", marginTop: "1rem" }}>
        <CommentSection competitionId={id} />
      </GlassCard>
    </div>
  );
}
