import mongoose from "mongoose";

const userBadgeSchema = new mongoose.Schema(
  {
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
      required: true,
    },
    awardedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 32,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profileImage: { type: String, default: "" },
    totalScore: { type: Number, default: 0 },
    badges: { type: [userBadgeSchema], default: [] },
  },
  { timestamps: true }
);

userSchema.methods.hasBadgeId = function hasBadgeId(badgeId) {
  return this.badges.some(
    (b) => b.badge.toString() === badgeId.toString()
  );
};

export default mongoose.model("User", userSchema);
