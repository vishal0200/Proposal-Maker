import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String, 
      default: "",
    },
    order: {
      type: Number,
      required: true,
      default: 0, // Order in which sections render
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Section", sectionSchema);