import mongoose from "mongoose";
import Submission from "../models/Submission.js";
import User from "../models/User.js";

export async function syncUserTotalScore(userId) {
  const agg = await Submission.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: "$score" } } },
  ]);
  const total = Math.round(agg[0]?.total ?? 0);
  await User.findByIdAndUpdate(userId, { totalScore: total });
  return total;
}
