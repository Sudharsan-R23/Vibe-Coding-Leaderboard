import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    criteria: { type: String, required: true },
    rarity: {
      type: String,
      enum: ["common", "uncommon", "rare", "legendary"],
      default: "common",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Badge", badgeSchema);
