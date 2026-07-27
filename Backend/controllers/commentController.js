import Comment from "../models/Comment.js";
import ActivityLog from "../models/ActivityLog.js";

// @desc    Get all comments for a proposal
// @route   GET /api/comments/:proposalId
// @access  Private
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ proposal: req.params.proposalId }).sort({
      createdAt: 1,
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Post a new comment
// @route   POST /api/comments
// @access  Public / Private (Client or User)
export const createComment = async (req, res) => {
  try {
    const { proposalId, authorName, authorEmail, content, isInternal } = req.body;

    if (!proposalId || !content || !authorName) {
      return res.status(400).json({ message: "Proposal ID, content, and author name required." });
    }

    const comment = await Comment.create({
      proposal: proposalId,
      authorName,
      authorEmail,
      content,
      isInternal: isInternal || false,
    });

    await ActivityLog.create({
      proposal: proposalId,
      action: "commented",
      actor: authorName,
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};