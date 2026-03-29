const rarityGlow = {
  common: "0 0 12px rgba(57, 255, 182, 0.2)",
  uncommon: "0 0 16px rgba(100, 180, 255, 0.35)",
  rare: "0 0 22px rgba(124, 92, 255, 0.5)",
  legendary: "0 0 28px rgba(255, 61, 172, 0.55), 0 0 48px rgba(255, 200, 87, 0.25)",
};

export function BadgeDisplay({ badges = [], size = "md", showEmpty }) {
  const s = size === "sm" ? "1.5rem" : "2rem";
  if (!badges.length && !showEmpty) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.4rem",
        alignItems: "center",
      }}
    >
      {badges.map((ub, i) => {
        const b = ub.badge || ub;
        if (!b) return null;
        const rarity = b.rarity || "common";
        return (
          <span
            key={`${b.key || b._id || i}`}
            className={`badge-chip rarity-${rarity}`}
            title={b.description || b.name}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.25rem 0.55rem",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(0,0,0,0.35)",
              fontSize: size === "sm" ? "0.72rem" : "0.8rem",
              boxShadow: rarityGlow[rarity] || rarityGlow.common,
              cursor: "help",
            }}
          >
            <span style={{ fontSize: s, lineHeight: 1 }}>{b.icon}</span>
            <span style={{ fontWeight: 600 }}>{b.name}</span>
          </span>
        );
      })}
      {!badges.length && showEmpty && (
        <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
          No badges yet — ship a submission to start grinding.
        </span>
      )}
    </div>
  );
}
