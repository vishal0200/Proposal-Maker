import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true, // "John Doe (Client)" or "Jane (Agency)"
    },
    authorEmail: String,
    content: {
      type: String,
      required: [true, "Comment content cannot be empty"],
    },
    isInternal: {
      type: Boolean,
      default: false, // Internal notes hidden from the client
    },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);