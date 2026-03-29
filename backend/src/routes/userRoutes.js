import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import {
  getMe,
  updateMe,
  getPublicProfile,
  listLeaderboard,
  listUsersAdmin,
  deleteUserAdmin,
  evaluateMyBadges,
} from "../controllers/userController.js";

const router = Router();

router.get("/leaderboard", listLeaderboard);
router.get("/admin/list", requireAuth, requireAdmin, listUsersAdmin);
router.get("/:id/profile", getPublicProfile);

router.use(requireAuth);
router.get("/me", getMe);
router.patch("/me", updateMe);
router.post("/me/badges/evaluate", evaluateMyBadges);
router.delete("/admin/:userId", requireAdmin, deleteUserAdmin);

export default router;
