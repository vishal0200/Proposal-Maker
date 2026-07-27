import Proposal from "../models/Proposal.js";
import Pricing from "../models/Pricing.js";
import Section from "../models/Section.js";
import ActivityLog from "../models/ActivityLog.js";
import crypto from "crypto";

// @desc    Create a new Proposal with Sections and Pricing
// @route   POST /api/proposals
// @access  Private (Authenticated User)
export const createProposal = async (req, res) => {
  try {
    const {
      company,
      client,
      templateUsed,
      title,
      validUntil,
      sections = [],
      pricingData = {},
      notes,
    } = req.body;

    // 1. Basic validation
    if (!company || !client || !title) {
      return res.status(400).json({
        message: "Please provide company, client, and proposal title.",
      });
    }

    // 2. Generate unique proposal number & shareable token
    const timestamp = Date.now().toString().slice(-4);
    const randomHex = crypto.randomBytes(2).toString("hex").toUpperCase();
    const proposalNumber = `PROP-${new Date().getFullYear()}-${timestamp}${randomHex}`;
    const shareableToken = crypto.randomBytes(16).toString("hex");

    // 3. Create the parent Proposal document first
    const proposal = new Proposal({
      user: req.user._id, // Set from auth middleware (req.user)
      company,
      client,
      templateUsed: templateUsed || null,
      title,
      proposalNumber,
      shareableToken,
      validUntil,
      notes,
      status: "draft",
    });

    // 4. Create associated Pricing document
    const pricing = await Pricing.create({
      proposal: proposal._id,
      pricingType: pricingData.pricingType || "fixed",
      currency: pricingData.currency || "USD",
      items: pricingData.items || [],
      discount: pricingData.discount || { type: "fixed", value: 0 },
      taxRate: pricingData.taxRate || 0,
    });

    // 5. Create associated Section documents (if provided)
    let sectionIds = [];
    if (sections.length > 0) {
      const createdSections = await Section.insertMany(
        sections.map((sec, index) => ({
          proposal: proposal._id,
          title: sec.title,
          content: sec.content || "",
          order: sec.order !== undefined ? sec.order : index,
        }))
      );
      sectionIds = createdSections.map((s) => s._id);
    }

    // 6. Link created Pricing & Sections back to Proposal, and set summary total
    proposal.pricing = pricing._id;
    proposal.sections = sectionIds;
    proposal.summaryTotal = {
      subtotal: pricing.subtotal,
      taxAmount: pricing.taxAmount,
      grandTotal: pricing.grandTotal,
      currency: pricing.currency,
    };

    await proposal.save();

    // 7. Record activity log
    await ActivityLog.create({
      proposal: proposal._id,
      action: "created",
      actor: "User",
      details: { createdBy: req.user._id },
    });

    res.status(201).json({
      message: "Proposal created successfully!",
      proposal,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all proposals for the logged-in user
// @route   GET /api/proposals
// @access  Private
export const getProposals = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    // Filter query strictly scoped to logged-in user
    const query = { user: req.user._id };

    // Optional status filter
    if (status) {
      query.status = status;
    }

    // Optional title search
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

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
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single proposal by ID with full details
// @route   GET /api/proposals/:id
// @access  Private
export const getProposalById = async (req, res) => {
  try {
    const proposal = await Proposal.findOne({
      _id: req.params.id,
      user: req.user._id, // Ensures user can only view their own proposal
    })
      .populate("company")
      .populate("client")
      .populate("sections")
      .populate("pricing")
      .populate("activityLogs")
      .populate("comments");

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found." });
    }

    res.status(200).json(proposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};