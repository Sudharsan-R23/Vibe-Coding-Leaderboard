import User from "../models/User.js";
import Submission from "../models/Submission.js";
import Comment from "../models/Comment.js";
import { getGlobalLeaderboard, getUserGlobalRank } from "../services/leaderboardService.js";
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

export async function getMe(req, res) {
  const user = await User.findById(req.userId)
    .select("-password")
    .populate("badges.badge")
    .lean();
  if (!user) return res.status(404).json({ message: "User not found" });
  const rank = await getUserGlobalRank(req.userId);
  res.json({ user: { ...user, rank } });
}

export async function evaluateMyBadges(req, res) {
  const unlocked = await evaluateBadgesForUser(req.userId);
  const badgeNotifications = await enrichNewBadges(unlocked);
  const user = await User.findById(req.userId)
    .select("-password")
    .populate("badges.badge")
    .lean();
  const rank = await getUserGlobalRank(req.userId);
  res.json({ user: { ...user, rank }, badgeNotifications });
}

export async function updateMe(req, res) {
  const { username, profileImage } = req.body;
  const updates = {};
  if (typeof username === "string" && username.trim()) updates.username = username.trim();
  if (typeof profileImage === "string") updates.profileImage = profileImage.trim();
  const user = await User.findByIdAndUpdate(req.userId, updates, {
    new: true,
    runValidators: true,
  })
    .select("-password")
    .populate("badges.badge");
  if (!user) return res.status(404).json({ message: "User not found" });
  const rank = await getUserGlobalRank(req.userId);
  res.json({ user: { ...user.toObject(), rank } });
}

export async function getPublicProfile(req, res) {
  const user = await User.findById(req.params.id)
    .select("username profileImage totalScore badges createdAt role")
    .populate("badges.badge")
    .lean();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const rank = await getUserGlobalRank(req.params.id);
  const history = await Submission.find({ user: req.params.id })
    .populate("competition", "title deadline difficulty tags")
    .sort({ submittedAt: -1 })
    .lean();
  res.json({ user: { ...user, rank }, history });
}

export async function listUsersAdmin(req, res) {
  const users = await User.find()
    .select("username email role createdAt totalScore")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  res.json({ users });
}

export async function listLeaderboard(req, res) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const data = await getGlobalLeaderboard({ skip, limit });
  res.json({ ...data, page, limit });
}

export async function deleteUserAdmin(req, res) {
  const target = await User.findById(req.params.userId);
  if (!target) return res.status(404).json({ message: "User not found" });
  if (target._id.equals(req.userId)) {
    return res.status(400).json({ message: "Cannot delete yourself" });
  }
  await Submission.deleteMany({ user: target._id });
  await Comment.deleteMany({ user: target._id });
  await User.deleteOne({ _id: target._id });
  res.status(204).send();
}
