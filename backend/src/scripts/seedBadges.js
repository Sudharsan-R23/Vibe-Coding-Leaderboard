import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Badge from "../models/Badge.js";
import { invalidateBadgeCache } from "../services/badgeService.js";

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

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI missing");
    process.exit(1);
  }
  await connectDB(uri);
  for (const b of defaults) {
    await Badge.updateOne(
      { key: b.key },
      { $setOnInsert: b },
      { upsert: true }
    );
  }
  invalidateBadgeCache();
  console.log("Badge seed complete.");
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
