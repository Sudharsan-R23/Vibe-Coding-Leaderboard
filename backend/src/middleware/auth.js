import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: "Invalid token" });
    req.userId = user._id.toString();
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    req.userId = null;
    req.user = null;
    return next();
  }
  try {
    const payload = verifyToken(token);
    User.findById(payload.sub)
      .then((user) => {
        if (user) {
          req.userId = user._id.toString();
          req.user = user;
        } else {
          req.userId = null;
          req.user = null;
        }
        next();
      })
      .catch(() => {
        req.userId = null;
        req.user = null;
        next();
      });
  } catch {
    req.userId = null;
    req.user = null;
    next();
  }
}
