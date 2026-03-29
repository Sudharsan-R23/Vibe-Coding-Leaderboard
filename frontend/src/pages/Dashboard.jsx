import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "../components/GlassCard.jsx";
import { BadgeDisplay } from "../components/BadgeDisplay.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api, handleBadgeNotifications } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

export function Dashboard() {
  const { user, isAdmin, refreshMe } = useAuth();
  const { notify, badgeUnlocked } = useToast();
  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const [busy, setBusy] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    rules: "",
    deadline: "",
    difficulty: "Medium",
    tags: "",
  });

  useEffect(() => {
    setProfileImage(user?.profileImage || "");
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        const { data } = await api.get("/users/admin/list");
        setAdminUsers(data.users || []);
      } catch {
        notify("Could not load operator roster");
      }
    })();
  }, [isAdmin, notify]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.patch("/users/me", { profileImage });
      await refreshMe();
      notify("Profile image updated");
    } catch (err) {
      notify(err.response?.data?.message || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const evalBadges = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/users/me/badges/evaluate");
      handleBadgeNotifications(data, badgeUnlocked);
      await refreshMe();
      if (!data.badgeNotifications?.length) notify("No new badges — keep building.");
    } catch {
      notify("Badge sync failed");
    } finally {
      setBusy(false);
    }
  };

  const createCompetition = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const tags = createForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const { data } = await api.post("/competitions", {
        ...createForm,
        tags,
        deadline: new Date(createForm.deadline).toISOString(),
      });
      notify(`Competition live: ${data.competition.title}`);
      setCreateForm({
        title: "",
        description: "",
        rules: "",
        deadline: "",
        difficulty: "Medium",
        tags: "",
      });
    } catch (err) {
      notify(err.response?.data?.message || "Could not create competition");
    } finally {
      setBusy(false);
    }
  };

  const deleteUser = async (id, name) => {
    if (!confirm(`Delete user @${name}? This removes their submissions.`)) return;
    try {
      await api.delete(`/users/admin/${id}`);
      setAdminUsers((u) => u.filter((x) => x._id !== id));
      notify("User deleted");
    } catch {
      notify("Delete failed");
    }
  };

  if (!user) return null;

  return (
    <div className="page">
      <h1 style={{ marginTop: "0.5rem" }}>{isAdmin ? "Command deck" : "Your deck"}</h1>
      <p style={{ color: "var(--muted)" }}>
        Total score: <strong>{user.totalScore ?? 0}</strong>
        {user.rank != null && (
          <>
            {" "}
            · Global rank: <strong>#{user.rank}</strong>
          </>
        )}
      </p>

      <div className="grid-2" style={{ marginTop: "1.25rem" }}>
        <GlassCard style={{ padding: "1.25rem" }}>
          <h3 style={{ marginTop: 0 }}>Achievements</h3>
          <BadgeDisplay badges={user.badges || []} showEmpty />
          <button type="button" className="btn btn-secondary" style={{ marginTop: "0.85rem" }} onClick={evalBadges} disabled={busy}>
            Re-sync badges
          </button>
        </GlassCard>

        <GlassCard style={{ padding: "1.25rem" }}>
          <h3 style={{ marginTop: 0 }}>Profile image</h3>
          <form onSubmit={saveProfile}>
            <label className="label">Image URL</label>
            <input
              className="input"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              placeholder="https://…"
            />
            <button type="submit" className="btn" style={{ marginTop: "0.65rem" }} disabled={busy}>
              Save
            </button>
          </form>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: 0 }}>
            <Link to={`/profile/${user.id}`}>View public profile →</Link>
          </p>
        </GlassCard>
      </div>

      {isAdmin && (
        <>
          <GlassCard style={{ padding: "1.25rem", marginTop: "1.25rem" }}>
            <h3 style={{ marginTop: 0 }}>Mint competition</h3>
            <form onSubmit={createCompetition} className="grid-2">
              <div>
                <label className="label">Title</label>
                <input
                  className="input"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  required
                />
                <label className="label" style={{ marginTop: "0.65rem" }}>
                  Deadline (local)
                </label>
                <input
                  className="input"
                  type="datetime-local"
                  value={createForm.deadline}
                  onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                  required
                />
                <label className="label" style={{ marginTop: "0.65rem" }}>
                  Difficulty
                </label>
                <select
                  className="input"
                  value={createForm.difficulty}
                  onChange={(e) => setCreateForm({ ...createForm, difficulty: e.target.value })}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
                <label className="label" style={{ marginTop: "0.65rem" }}>
                  Tags (comma separated)
                </label>
                <input
                  className="input"
                  value={createForm.tags}
                  onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                  placeholder="react, node, ui"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  rows={4}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  required
                />
                <label className="label" style={{ marginTop: "0.65rem" }}>
                  Rules
                </label>
                <textarea
                  className="input"
                  rows={4}
                  value={createForm.rules}
                  onChange={(e) => setCreateForm({ ...createForm, rules: e.target.value })}
                  required
                />
              <button type="submit" className="btn" style={{ marginTop: "0.65rem" }} disabled={busy}>
                  Publish competition
                </button>
              </div>
            </form>
          </GlassCard>

          <GlassCard style={{ padding: "1.25rem", marginTop: "1.25rem" }}>
            <h3 style={{ marginTop: 0 }}>Operator roster</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                    <th style={{ padding: "0.4rem" }}>User</th>
                    <th>Role</th>
                    <th>Score</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u) => (
                    <tr key={u._id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <td style={{ padding: "0.5rem 0.4rem" }}>
                        <Link to={`/profile/${u._id}`}>@{u.username}</Link>
                        <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{u.email}</div>
                      </td>
                      <td>{u.role}</td>
                      <td>{u.totalScore}</td>
                      <td>
                        {u._id !== user.id && (
                          <button
                            type="button"
                            className="btn btn-danger"
                            style={{ padding: "0.35rem 0.6rem", fontSize: "0.8rem" }}
                            onClick={() => deleteUser(u._id, u.username)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      )}

      {!isAdmin && (
        <GlassCard style={{ padding: "1.25rem", marginTop: "1.25rem" }}>
          <h3 style={{ marginTop: 0 }}>Next moves</h3>
          <Link to="/competitions" className="btn">
            Hunt competitions
          </Link>
        </GlassCard>
      )}
    </div>
  );
}
