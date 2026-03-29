import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

const nav = [
  { to: "/competitions", label: "Competitions" },
  { to: "/leaderboard", label: "Leaderboard" },
];

export function Navbar() {
  const { user, loading, logout, isAdmin } = useAuth();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid rgba(57,255,182,0.12)",
        background: "rgba(6,8,10,0.75)",
        backdropFilter: "blur(14px)",
      }}
    >
      <div
        className="page"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          paddingTop: "0.75rem",
          paddingBottom: "0.75rem",
          maxWidth: 1120,
        }}
      >
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <motion.div
            style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
            whileHover={{ scale: 1.02 }}
          >
            <span
              className="mono"
              style={{
                fontWeight: 800,
                fontSize: "1.05rem",
                letterSpacing: "0.06em",
                color: "var(--neon)",
                textShadow: "0 0 18px rgba(57,255,182,0.35)",
              }}
            >
              VIBE
            </span>
            <span style={{ fontWeight: 600, opacity: 0.9 }}>Coding Arena</span>
          </motion.div>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              style={({ isActive }) => ({
                padding: "0.4rem 0.75rem",
                borderRadius: 999,
                textDecoration: "none",
                color: isActive ? "var(--bg-deep)" : "var(--muted)",
                background: isActive ? "var(--neon)" : "transparent",
                fontWeight: 600,
                fontSize: "0.88rem",
              })}
            >
              {n.label}
            </NavLink>
          ))}
          {user && (
            <>
              <NavLink
                to="/dashboard"
                style={({ isActive }) => ({
                  padding: "0.4rem 0.75rem",
                  borderRadius: 999,
                  textDecoration: "none",
                  color: isActive ? "var(--bg-deep)" : "var(--muted)",
                  background: isActive ? "var(--accent-2)" : "transparent",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                })}
              >
                {isAdmin ? "Command" : "Deck"}
              </NavLink>
              <Link
                to={`/profile/${user.id}`}
                style={{
                  padding: "0.4rem 0.75rem",
                  borderRadius: 999,
                  color: "var(--text)",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                }}
              >
                @{user.username}
              </Link>
              <button type="button" className="btn btn-ghost" onClick={logout}>
                Log out
              </button>
            </>
          )}
          {!user && !loading && (
            <>
              <Link to="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn">
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
