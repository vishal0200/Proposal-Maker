import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "created",
        "updated",
        "sent",
        "viewed",
        "accepted",
        "declined",
        "commented",
        "downloaded_pdf",
      ],
    },
    actor: {
      type: String, // e.g., "User", "Client", or "System"
      required: true,
    },
    ipAddress: String,
    userAgent: String,
    details: mongoose.Schema.Types.Mixed, // Extra custom metadata
  },
  { timestamps: true }
);

export default mongoose.model("ActivityLog", activityLogSchema);