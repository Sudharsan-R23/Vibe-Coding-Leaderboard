import Badge from "../models/Badge.js";

export async function listBadges(req, res) {
  const badges = await Badge.find().sort({ key: 1 }).lean();
  res.json({ badges });
}
