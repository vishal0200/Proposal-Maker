import Proposal from "../models/Proposal.js";

// @desc    Get overall proposal analytics & dashboard stats
// @route   GET /api/analytics
// @access  Private
export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalProposals, statusCounts, revenueStats] = await Promise.all([
      Proposal.countDocuments({ user: userId }),

      // Aggregate breakdown by status (draft, sent, accepted, declined)
      Proposal.aggregate([
        { $match: { user: userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Calculate total potential value & total won value
      Proposal.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            totalPipelineValue: { $sum: "$summaryTotal.grandTotal" },
            acceptedValue: {
              $sum: {
                $cond: [{ $eq: ["$status", "accepted"] }, "$summaryTotal.grandTotal", 0],
              },
            },
          },
        },
      ]),
    ]);

    // Format status breakdown array into clean object
    const statusBreakdown = {
      draft: 0,
      sent: 0,
      viewed: 0,
      accepted: 0,
      declined: 0,
      expired: 0,
    };

    statusCounts.forEach((item) => {
      statusBreakdown[item._id] = item.count;
    });

    const acceptedCount = statusBreakdown.accepted || 0;
    const closedCount = (statusBreakdown.accepted || 0) + (statusBreakdown.declined || 0);
    const winRate = closedCount > 0 ? ((acceptedCount / closedCount) * 100).toFixed(1) : 0;

    res.status(200).json({
      totalProposals,
      statusBreakdown,
      winRate: `${winRate}%`,
      financials: {
        totalPipelineValue: revenueStats[0]?.totalPipelineValue || 0,
        acceptedValue: revenueStats[0]?.acceptedValue || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};