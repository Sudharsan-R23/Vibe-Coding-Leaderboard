import Comment from "../models/Comment.js";

function buildTree(flat) {
  const byId = new Map(
    flat.map((c) => [c._id.toString(), { ...c, replies: [] }])
  );
  const roots = [];
  for (const c of flat) {
    const node = byId.get(c._id.toString());
    const pid = c.parent ? c.parent.toString() : null;
    if (pid && byId.has(pid)) {
      byId.get(pid).replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export async function listComments(req, res) {
  const { competitionId } = req.params;
  const flat = await Comment.find({ competition: competitionId })
    .sort({ createdAt: 1 })
    .populate("user", "username profileImage role")
    .lean();
  const tree = buildTree(flat);
  res.json({ comments: tree, flat });
}

export async function addComment(req, res) {
  const { competitionId } = req.params;
  const { content, parentId } = req.body;
  if (parentId) {
    const parent = await Comment.findById(parentId);
    if (!parent || parent.competition.toString() !== competitionId) {
      return res.status(400).json({ message: "Invalid parent comment" });
    }
  }
  const doc = await Comment.create({
    competition: competitionId,
    user: req.userId,
    content,
    parent: parentId || null,
  });
  const populated = await Comment.findById(doc._id).populate(
    "user",
    "username profileImage role"
  );
  res.status(201).json({ comment: populated });
}

export async function toggleLikeComment(req, res) {
  const { commentId } = req.params;
  const c = await Comment.findById(commentId);
  if (!c) return res.status(404).json({ message: "Comment not found" });
  const uid = req.userId;
  const idx = c.likes.findIndex((id) => id.toString() === uid);
  if (idx >= 0) c.likes.splice(idx, 1);
  else c.likes.push(uid);
  await c.save();
  res.json({ likes: c.likes.length, liked: idx < 0 });
}

export async function deleteComment(req, res) {
  const { commentId } = req.params;
  const c = await Comment.findById(commentId);
  if (!c) return res.status(404).json({ message: "Comment not found" });
  const isOwner = c.user.toString() === req.userId;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "Not allowed" });
  }

  const queue = [c._id.toString()];
  const toDelete = new Set();
  while (queue.length) {
    const id = queue.pop();
    if (toDelete.has(id)) continue;
    toDelete.add(id);
    const children = await Comment.find({ parent: id }).select("_id").lean();
    for (const ch of children) queue.push(ch._id.toString());
  }
  await Comment.deleteMany({ _id: { $in: [...toDelete] } });
  res.status(204).send();
}
