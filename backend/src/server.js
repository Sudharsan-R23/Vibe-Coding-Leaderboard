import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import Badge from "./models/Badge.js";
import { invalidateBadgeCache } from "./services/badgeService.js";

const defaults = [
  {
    key: "beginner",
    name: "Beginner",
    description: "Submitted your first solution.",
    icon: "🟢",
    criteria: "First submission to any competition",
    rarity: "common",
  },
  {
    key: "challenger",
    name: "Challenger",
    description: "Participated in 5 different competitions.",
    icon: "🔵",
    criteria: "Distinct competitions with at least one submission: 5",
    rarity: "uncommon",
  },
  {
    key: "winner",
    name: "Winner",
    description: "Ranked #1 on a competition leaderboard.",
    icon: "🟣",
    criteria: "Top placement on any competition by composite rank",
    rarity: "rare",
  },
  {
    key: "streak_master",
    name: "Streak Master",
    description: "Joined 3 consecutive platform competitions (by schedule).",
    icon: "🟡",
    criteria: "Longest run of consecutive competitions (by createdAt) with a submission is ≥ 3",
    rarity: "rare",
  },
  {
    key: "top_ranker",
    name: "Top Ranker",
    description: "Reached the global top 10 by total score.",
    icon: "🔴",
    criteria: "Global leaderboard position ≤ 10",
    rarity: "legendary",
  },
  {
    key: "legend",
    name: "Legend",
    description: "Accumulated 1000+ career points.",
    icon: "⚫",
    criteria: "totalScore ≥ 1000",
    rarity: "legendary",
  },
];

async function ensureBadges() {
  for (const b of defaults) {
    await Badge.updateOne({ key: b.key }, { $setOnInsert: b }, { upsert: true });
  }
}

const port = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

connectDB(uri)
  .then(() => ensureBadges())
  .then(() => {
    invalidateBadgeCache();
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
