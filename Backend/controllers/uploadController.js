import Attachment from "../models/Attachment.js";

// @desc    Handle file upload response and store attachment metadata
// @route   POST /api/uploads/attachment
// @access  Private
export const uploadAttachment = async (req, res) => {
  try {
    const { proposalId, fileName, fileUrl, fileType, fileSize } = req.body;

    if (!proposalId || !fileUrl) {
      return res.status(400).json({ message: "Proposal ID and File URL are required." });
    }

    const attachment = await Attachment.create({
      proposal: proposalId,
      fileName: fileName || "Untitled File",
      fileUrl,
      fileType,
      fileSize,
    });

    res.status(201).json({ message: "File attached successfully!", attachment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete attached file reference
// @route   DELETE /api/uploads/attachment/:id
// @access  Private
export const deleteAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.findByIdAndDelete(req.params.id);
    if (!attachment) return res.status(404).json({ message: "Attachment not found." });

    res.status(200).json({ message: "Attachment deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};