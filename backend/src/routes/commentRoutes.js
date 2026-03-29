import { Router } from "express";
import { body } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import { handleValidation } from "../middleware/validate.js";
import {
  listComments,
  addComment,
  toggleLikeComment,
  deleteComment,
} from "../controllers/commentController.js";

const router = Router();

router.get("/competition/:competitionId", listComments);

router.post(
  "/competition/:competitionId",
  requireAuth,
  body("content").trim().isLength({ min: 1, max: 5000 }),
  body("parentId").optional().isMongoId(),
  handleValidation,
  addComment
);

router.post("/:commentId/like", requireAuth, toggleLikeComment);
router.delete("/:commentId", requireAuth, deleteComment);

export default router;
