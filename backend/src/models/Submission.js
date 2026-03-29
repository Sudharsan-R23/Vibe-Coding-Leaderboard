import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    competition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hostedLink: { type: String, required: true, trim: true },
    score: { type: Number, default: 0, min: 0 },
    likes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

submissionSchema.index({ competition: 1, user: 1 }, { unique: true });
submissionSchema.index({ competition: 1, score: -1, submittedAt: 1 });

export default mongoose.model("Submission", submissionSchema);
