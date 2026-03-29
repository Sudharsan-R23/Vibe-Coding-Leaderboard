import Submission from "../models/Submission.js";
import User from "../models/User.js";

/** Higher rank value = better. Used for sorting (desc). */
export function submissionRankValue(sub) {
  const likeCount = sub.likes?.length ?? 0;
  const submittedMs = new Date(sub.submittedAt).getTime();
  const speedTerm = 1e12 - submittedMs;
  return sub.score * 1_000_000 + likeCount * 10_000 + speedTerm / 1e15;
}

/** Per-competition ordered leaderboard entries (Mongo docs + user info). */
export async function getCompetitionLeaderboard(competitionId) {
  const subs = await Submission.find({ competition: competitionId })
    .populate("user", "username profileImage totalScore role")
    .lean();

  return subs
    .map((s) => ({
      ...s,
      rankValue: submissionRankValue(s),
      likeCount: s.likes?.length ?? 0,
    }))
    .sort((a, b) => b.rankValue - a.rankValue)
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

export async function getGlobalLeaderboard({ skip = 0, limit = 50 } = {}) {
  const users = await User.find({ role: "user" })
    .select("username profileImage totalScore createdAt badges")
    .populate("badges.badge", "key name icon rarity description")
    .sort({ totalScore: -1, createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalUsers = await User.countDocuments({ role: "user" });

  return {
    total: totalUsers,
    entries: users.map((u, i) => ({
      rank: skip + i + 1,
      userId: u._id,
      username: u.username,
      profileImage: u.profileImage,
      totalScore: u.totalScore,
      badges: u.badges || [],
    })),
  };
}

export async function getUserGlobalRank(userId) {
  const user = await User.findById(userId).select("totalScore role").lean();
  if (!user) return null;
  if (user.role === "admin") return null;
  const higher = await User.countDocuments({
    role: "user",
    $or: [
      { totalScore: { $gt: user.totalScore } },
      {
        totalScore: user.totalScore,
        _id: { $lt: userId },
      },
    ],
  });
  return higher + 1;
}
