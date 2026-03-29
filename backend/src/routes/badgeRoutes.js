import { Router } from "express";
import { listBadges } from "../controllers/badgeController.js";

const router = Router();
router.get("/", listBadges);

export default router;
