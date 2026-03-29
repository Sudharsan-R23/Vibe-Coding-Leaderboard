import Submission from "../models/Submission.js";
import Competition from "../models/Competition.js";
import { getCompetitionLeaderboard } from "../services/leaderboardService.js";
import { syncUserTotalScore } from "../utils/userScore.js";
import { evaluateBadgesForUser } from "../services/badgeService.js";
import Badge from "../models/Badge.js";

async function enrichNewBadges(rawNew) {
  if (!rawNew.length) return [];
  const keys = rawNew.map((n) => n.key);
  const badges = await Badge.find({ key: { $in: keys } }).lean();
  const byKey = Object.fromEntries(badges.map((b) => [b.key, b]));
  return rawNew
    .map((n) => byKey[n.key])
    .filter(Boolean)
    .map((b) => ({
      key: b.key,
      name: b.name,
      icon: b.icon,
      description: b.description,
      rarity: b.rarity,
    }));
}

export async function listSubmissions(req, res) {
  const competitionId = req.params.competitionId;
  const board = await getCompetitionLeaderboard(competitionId);
  res.json({ leaderboard: board });
}

export async function createSubmission(req, res) {
  const { competitionId } = req.params;
  const { hostedLink } = req.body;

  const comp = await Competition.findById(competitionId);
  if (!comp) return res.status(404).json({ message: "Competition not found" });

  try {
    const sub = await Submission.create({
      competition: competitionId,
      user: req.userId,
      hostedLink,
    });
    await syncUserTotalScore(req.userId);
    const unlocked = await evaluateBadgesForUser(req.userId);
    const badgeNotifications = await enrichNewBadges(unlocked);
    const populated = await Submission.findById(sub._id).populate("user", "username profileImage");
    res.status(201).json({ submission: populated, badgeNotifications });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ message: "You already submitted to this competition" });
    }
    throw e;
  }
}

export async function updateSubmissionScore(req, res) {
  const { submissionId } = req.params;
  const { score } = req.body;
  if (typeof score !== "number" || score < 0) {
    return res.status(400).json({ message: "Invalid score" });
  }
  const sub = await Submission.findById(submissionId);
  if (!sub) return res.status(404).json({ message: "Submission not found" });

  sub.score = score;
  await sub.save();
  await syncUserTotalScore(sub.user);
  const unlocked = await evaluateBadgesForUser(sub.user);
  const badgeNotifications = await enrichNewBadges(unlocked);
  const populated = await Submission.findById(sub._id).populate("user", "username profileImage");
  res.json({ submission: populated, badgeNotifications });
}

export async function toggleLikeSubmission(req, res) {
  const { submissionId } = req.params;
  const sub = await Submission.findById(submissionId);
  if (!sub) return res.status(404).json({ message: "Submission not found" });

  const uid = req.userId;
  const idx = sub.likes.findIndex((id) => id.toString() === uid);
  if (idx >= 0) sub.likes.splice(idx, 1);
  else sub.likes.push(uid);
  await sub.save();

  await syncUserTotalScore(sub.user);
  const unlocked = await evaluateBadgesForUser(sub.user);

  res.json({
    likes: sub.likes.length,
    liked: idx < 0,
    badgeNotifications: await enrichNewBadges(unlocked),
  });
}
