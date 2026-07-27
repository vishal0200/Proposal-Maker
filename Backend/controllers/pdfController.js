import Proposal from "../models/Proposal.js";
import ActivityLog from "../models/ActivityLog.js";

// @desc    Generate HTML / Print layout ready for PDF conversion
// @route   GET /api/pdf/generate/:proposalId
// @access  Private
export const generatePdfView = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.proposalId)
      .populate("company")
      .populate("client")
      .populate("sections")
      .populate("pricing");

    if (!proposal) return res.status(404).json({ message: "Proposal not found." });

    // Track activity log for PDF exports
    await ActivityLog.create({
      proposal: proposal._id,
      action: "downloaded_pdf",
      actor: req.user ? "User" : "Client",
    });

    res.status(200).json({
      message: "PDF source document prepared",
      documentData: {
        title: proposal.title,
        proposalNumber: proposal.proposalNumber,
        company: proposal.company,
        client: proposal.client,
        sections: proposal.sections,
        pricing: proposal.pricing,
        summaryTotal: proposal.summaryTotal,
        createdAt: proposal.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};