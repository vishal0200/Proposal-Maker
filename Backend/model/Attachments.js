import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String, // Cloudinary or AWS S3 URL
      required: true,
    },
    fileType: String, // e.g., "application/pdf", "image/png"
    fileSize: Number, // In bytes
  },
  { timestamps: true }
);

export default mongoose.model("Attachment", attachmentSchema);