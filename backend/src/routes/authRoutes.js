import { Router } from "express";
import {
  register,
  login,
  registerValidators,
  loginValidators,
} from "../controllers/authController.js";
import { handleValidation } from "../middleware/validate.js";

const router = Router();
router.post("/register", ...registerValidators, handleValidation, register);
router.post("/login", ...loginValidators, handleValidation, login);

export default router;
