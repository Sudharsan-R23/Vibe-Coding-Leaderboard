import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import { optionalAuth } from "../middleware/auth.js";
import {
  listCompetitions,
  getCompetition,
  createCompetition,
  updateCompetition,
  deleteCompetition,
} from "../controllers/competitionController.js";

const router = Router();

router.get("/", listCompetitions);
router.get("/:id", optionalAuth, getCompetition);

router.use(requireAuth);
router.post("/", requireAdmin, createCompetition);
router.patch("/:id", requireAdmin, updateCompetition);
router.delete("/:id", requireAdmin, deleteCompetition);

export default router;
