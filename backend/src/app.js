import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import competitionRoutes from "./routes/competitionRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import badgeRoutes from "./routes/badgeRoutes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/badges", badgeRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
