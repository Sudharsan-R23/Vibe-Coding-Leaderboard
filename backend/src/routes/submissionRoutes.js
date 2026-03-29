import { Router } from "express";
import { body } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import { handleValidation } from "../middleware/validate.js";
import {
  listSubmissions,
  createSubmission,
  updateSubmissionScore,
  toggleLikeSubmission,
} from "../controllers/submissionController.js";

const router = Router();

router.get("/competition/:competitionId/leaderboard", listSubmissions);

const linkValidators = [
  body("hostedLink").trim().isURL({ require_protocol: true }),
  handleValidation,
];

router.post(
  "/competition/:competitionId",
  requireAuth,
  linkValidators,
  createSubmission
);

router.patch(
  "/:submissionId/score",
  requireAuth,
  requireAdmin,
  body("score").isFloat({ min: 0 }),
  handleValidation,
  updateSubmissionScore
);

router.post("/:submissionId/like", requireAuth, toggleLikeSubmission);

export default router;
