import bcrypt from "bcryptjs";
import { body } from "express-validator";
import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const registerValidators = [
  body("username").trim().isLength({ min: 2, max: 32 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
];

export const loginValidators = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];

export async function register(req, res) {
  const { username, email, password } = req.body;
  const exists = await User.findOne({
    $or: [{ email }, { username: new RegExp(`^${escapeRegex(username)}$`, "i") }],
  });
  if (exists) {
    return res.status(409).json({ message: "Email or username already in use" });
  }
  const count = await User.countDocuments();
  const role = count === 0 ? "admin" : "user";
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email,
    password: hash,
    role,
  });
  const token = signToken({ sub: user._id.toString(), role: user.role });
  res.status(201).json({
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      totalScore: user.totalScore,
    },
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = signToken({ sub: user._id.toString(), role: user.role });
  res.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      totalScore: user.totalScore,
    },
  });
}
