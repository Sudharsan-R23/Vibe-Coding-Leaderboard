import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GlassCard } from "../components/GlassCard.jsx";

export function Home() {
  return (
    <div className="page">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: 720, marginTop: "2rem" }}
      >
        <p className="mono" style={{ color: "var(--neon)", fontWeight: 700, fontSize: "0.9rem" }}>
          /// VIBE_CODING_LIVE
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.1rem)", lineHeight: 1.1, margin: "0.5rem 0" }}>
          Ship hosted builds.
          <span style={{ color: "var(--accent-2)" }}> Climb the neon board.</span>
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.1rem", lineHeight: 1.6 }}>
          Timed competitions, threaded comms, and a badge system that reacts to how you grind — from
          first deploy to legend-tier points.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem",   flexWrap: "wrap" }}>
          <Link to="/competitions" className="btn">
            Browse competitions
          </Link>
          <Link to="/leaderboard" className="btn btn-secondary">
            Global leaderboard
          </Link>
        </div>
      </motion.div>

      <div className="grid-2" style={{ marginTop: "2.5rem" }}>
        <GlassCard delay={0.05} style={{ padding: "1.25rem" }}>
          <h3 style={{ marginTop: 0 }}>Composite ranking</h3>
          <p style={{ color: "var(--muted)", lineHeight: 1.55 }}>
            Scores blend raw points, earlier submission time, and community likes — so speed and
            polish both matter.
          </p>
        </GlassCard>
        <GlassCard delay={0.1} style={{ padding: "1.25rem" }}>
          <h3 style={{ marginTop: 0 }}>Badges that watch you</h3>
          <p style={{ color: "var(--muted)", lineHeight: 1.55 }}>
            Achievements unlock from real activity: streaks, wins, top-10 global, and the 1k-point
            ceiling. Duplicates never drop twice.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
