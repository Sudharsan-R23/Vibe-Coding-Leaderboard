import Badge from "../models/Badge.js";
import User from "../models/User.js";
import Submission from "../models/Submission.js";
import Competition from "../models/Competition.js";
import {
  getCompetitionLeaderboard,
  getGlobalLeaderboard,
} from "./leaderboardService.js";

const BADGE_KEYS = {
  BEGINNER: "beginner",
  CHALLENGER: "challenger",
  WINNER: "winner",
  STREAK_MASTER: "streak_master",
  TOP_RANKER: "top_ranker",
  LEGEND: "legend",
};

let badgeIdByKeyCache = null;

async function getBadgeIdByKey() {
  if (badgeIdByKeyCache) return badgeIdByKeyCache;
  const list = await Badge.find().lean();
  const map = {};
  for (const b of list) map[b.key] = b._id;
  badgeIdByKeyCache = map;
  return map;
}

export function invalidateBadgeCache() {
  badgeIdByKeyCache = null;
}

async function awardBadgeIfNeeded(userId, key, newlyAwarded) {
  const map = await getBadgeIdByKey();
  const badgeId = map[key];
  if (!badgeId) return;

  const user = await User.findById(userId);
  if (!user || user.hasBadgeId(badgeId)) return;

  user.badges.push({ badge: badgeId, awardedAt: new Date() });
  await user.save();
  newlyAwarded.push({ key, badgeId });
}

async function countDistinctCompetitions(userId) {
  return Submission.distinct("competition", { user: userId }).then(
    (ids) => ids.length
  );
}

async function hasWonAnyCompetition(userId) {
  const comps = await Competition.find().select("_id").lean();
  for (const c of comps) {
    const board = await getCompetitionLeaderboard(c._id);
    const top = board[0];
    if (top && top.user && top.user._id.toString() === userId.toString()) {
      return true;
    }
  }
  return false;
}

/**
 * Streak: user participated in 3+ consecutive competitions when competitions
 * are ordered by createdAt ascending (no gap in sequence indices).
 */
async function hasConsecutiveThreeCompetitions(userId) {
  const comps = await Competition.find().sort({ createdAt: 1 }).select("_id").lean();
  if (comps.length < 3) return false;
  const ids = comps.map((c) => c._id.toString());
  const userSubs = await Submission.find({ user: userId })
    .select("competition")
    .lean();
  const set = new Set(userSubs.map((s) => s.competition.toString()));

  let best = 0;
  let cur = 0;
  for (const id of ids) {
    if (set.has(id)) {
      cur += 1;
      best = Math.max(best, cur);
    } else {
      cur = 0;
    }
  }
  return best >= 3;
}

async function isTopTenGlobal(userId) {
  const { entries } = await getGlobalLeaderboard({ skip: 0, limit: 10 });
  return entries.some((e) => e.userId.toString() === userId.toString());
}

/**
 * Run all badge rules; returns array of { key, badgeId } for newly unlocked.
 */
export async function evaluateBadgesForUser(userId) {
  const newlyAwarded = [];
  const user = await User.findById(userId).select("totalScore badges").lean();
  if (!user) return newlyAwarded;

  const subCount = await Submission.countDocuments({ user: userId });
  if (subCount >= 1) {
    await awardBadgeIfNeeded(userId, BADGE_KEYS.BEGINNER, newlyAwarded);
  }

  const distinctComps = await countDistinctCompetitions(userId);
  if (distinctComps >= 5) {
    await awardBadgeIfNeeded(userId, BADGE_KEYS.CHALLENGER, newlyAwarded);
  }

  if (await hasWonAnyCompetition(userId)) {
    await awardBadgeIfNeeded(userId, BADGE_KEYS.WINNER, newlyAwarded);
  }

  if (await hasConsecutiveThreeCompetitions(userId)) {
    await awardBadgeIfNeeded(userId, BADGE_KEYS.STREAK_MASTER, newlyAwarded);
  }

  if (user.totalScore >= 1000) {
    await awardBadgeIfNeeded(userId, BADGE_KEYS.LEGEND, newlyAwarded);
  }

  if (await isTopTenGlobal(userId)) {
    await awardBadgeIfNeeded(userId, BADGE_KEYS.TOP_RANKER, newlyAwarded);
  }

  return newlyAwarded;
}

export { BADGE_KEYS };
