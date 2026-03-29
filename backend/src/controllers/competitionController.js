import Competition from "../models/Competition.js";
import Submission from "../models/Submission.js";
import Comment from "../models/Comment.js";

export async function listCompetitions(req, res) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const skip = (page - 1) * limit;
  const q = (req.query.q || "").trim();
  const difficulty = req.query.difficulty;
  const tag = (req.query.tag || "").trim();

  const filter = {};
  if (difficulty && ["Easy", "Medium", "Hard"].includes(difficulty)) {
    filter.difficulty = difficulty;
  }
  if (tag) {
    filter.tags = tag;
  }
  if (q) {
    filter.$text = { $search: q };
  }

  const [items, total] = await Promise.all([
    Competition.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "username")
      .lean(),
    Competition.countDocuments(filter),
  ]);

  res.json({ items, total, page, limit });
}

export async function getCompetition(req, res) {
  const c = await Competition.findById(req.params.id)
    .populate("createdBy", "username")
    .lean();
  if (!c) return res.status(404).json({ message: "Competition not found" });
  let mySubmission = null;
  if (req.userId) {
    mySubmission = await Submission.findOne({
      competition: c._id,
      user: req.userId,
    }).lean();
  }
  res.json({ competition: c, mySubmission });
}

export async function createCompetition(req, res) {
  const { title, description, rules, deadline, difficulty, tags } = req.body;
  const c = await Competition.create({
    title,
    description,
    rules,
    deadline,
    difficulty: difficulty || "Medium",
    tags: Array.isArray(tags) ? tags : [],
    createdBy: req.userId,
  });
  const populated = await Competition.findById(c._id).populate("createdBy", "username");
  res.status(201).json({ competition: populated });
}

export async function updateCompetition(req, res) {
  const updates = { ...req.body };
  delete updates.createdBy;
  const c = await Competition.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).populate("createdBy", "username");
  if (!c) return res.status(404).json({ message: "Competition not found" });
  res.json({ competition: c });
}

export async function deleteCompetition(req, res) {
  const id = req.params.id;
  const c = await Competition.findByIdAndDelete(id);
  if (!c) return res.status(404).json({ message: "Competition not found" });
  await Promise.all([
    Submission.deleteMany({ competition: id }),
    Comment.deleteMany({ competition: id }),
  ]);
  res.status(204).send();
}
