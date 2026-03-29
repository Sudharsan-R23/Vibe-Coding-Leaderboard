import mongoose from "mongoose";

const competitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    rules: { type: String, required: true },
    deadline: { type: Date, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    tags: { type: [String], default: [] },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

competitionSchema.index({ title: "text", description: "text", tags: "text" });
competitionSchema.index({ deadline: -1 });

export default mongoose.model("Competition", competitionSchema);
