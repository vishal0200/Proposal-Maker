import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Template name is required"],
      trim: true,
    },
    category: {
      type: String, // e.g., "Web Design", "Marketing", "Consulting"
      default: "General",
    },
    description: String,
    thumbnailUrl: String,
    // Reusable content sections
    defaultSections: [
      {
        title: String,
        content: String, // Rich text HTML / Markdown
        order: Number,
      },
    ],
    isGlobal: {
      type: Boolean,
      default: false, // Set to true if offering platform-wide default templates
    },
  },
  { timestamps: true }
);

export default mongoose.model("Template", templateSchema);