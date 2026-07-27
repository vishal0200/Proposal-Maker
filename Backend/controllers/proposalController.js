import Proposal from "../models/Proposal.js";
import Pricing from "../models/Pricing.js";
import ActivityLog from "../models/ActivityLog.js";
import crypto from "crypto";

// @desc    Create a new Proposal shell with initial Pricing table
// @route   POST /api/proposals
// @access  Private
export const createProposal = async (req, res) => {
  try {
    const { company, client, templateUsed, title, validUntil, notes } = req.body;

    if (!company || !client || !title) {
      return res.status(400).json({ message: "Company, client, and title are required." });
    }

    const timestamp = Date.now().toString().slice(-4);
    const randomHex = crypto.randomBytes(2).toString("hex").toUpperCase();
    const proposalNumber = `PROP-${new Date().getFullYear()}-${timestamp}${randomHex}`;
    const shareableToken = crypto.randomBytes(16).toString("hex");

    const proposal = new Proposal({
      user: req.user._id,
      company,
      client,
      templateUsed: templateUsed || null,
      title,
      proposalNumber,
      shareableToken,
      validUntil,
      notes,
    });

    // Automatically create empty pricing table bound to this proposal
    const pricing = await Pricing.create({ proposal: proposal._id });
    proposal.pricing = pricing._id;

    await proposal.save();

    await ActivityLog.create({
      proposal: proposal._id,
      action: "created",
      actor: "User",
    });

    res.status(201).json(proposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all proposals for the logged-in user with filters
// @route   GET /api/proposals
// @access  Private
export const getProposals = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };

    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;

    const [proposals, total] = await Promise.all([
      Proposal.find(query)
        .populate("client", "name email contactPerson")
        .populate("company", "name logoUrl")
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit)),
      Proposal.countDocuments(query),
    ]);

    res.status(200).json({
      proposals,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single proposal with full populated details
// @route   GET /api/proposals/:id
// @access  Private
export const getProposalById = async (req, res) => {
  try {
    const proposal = await Proposal.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("company")
      .populate("client")
      .populate("sections")
      .populate("pricing")
      .populate("attachments");

    if (!proposal) return res.status(404).json({ message: "Proposal not found." });

    res.status(200).json(proposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update proposal status (draft -> sent -> accepted)
// @route   PATCH /api/proposals/:id/status
// @access  Private
export const updateProposalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const proposal = await Proposal.findOne({ _id: req.params.id, user: req.user._id });

    if (!proposal) return res.status(404).json({ message: "Proposal not found." });

    proposal.status = status;
    if (status === "sent") proposal.sentAt = new Date();
    await proposal.save();

    await ActivityLog.create({
      proposal: proposal._id,
      action: status,
      actor: "User",
    });

    res.status(200).json({ message: `Status updated to ${status}`, proposal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};