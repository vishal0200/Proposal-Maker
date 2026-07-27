import Pricing from "../models/Pricing.js";
import Proposal from "../models/Proposal.js";

// @desc    Get pricing details for a proposal
// @route   GET /api/pricing/:proposalId
// @access  Private
export const getPricingByProposal = async (req, res) => {
  try {
    const pricing = await Pricing.findOne({ proposal: req.params.proposalId });
    if (!pricing) return res.status(404).json({ message: "Pricing table not found." });
    res.status(200).json(pricing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update line items, tax rate, and discounts
// @route   PUT /api/pricing/:id
// @access  Private
export const updatePricing = async (req, res) => {
  try {
    const { items, discount, taxRate, currency, pricingType } = req.body;

    const pricing = await Pricing.findById(req.params.id);
    if (!pricing) return res.status(404).json({ message: "Pricing record not found." });

    if (items) pricing.items = items;
    if (discount) pricing.discount = discount;
    if (taxRate !== undefined) pricing.taxRate = taxRate;
    if (currency) pricing.currency = currency;
    if (pricingType) pricing.pricingType = pricingType;

    // Trigger pre-save hook to recalculate amounts
    await pricing.save();

    // Sync light summary back to Proposal model for quick dashboard listing
    await Proposal.findByIdAndUpdate(pricing.proposal, {
      summaryTotal: {
        subtotal: pricing.subtotal,
        taxAmount: pricing.taxAmount,
        grandTotal: pricing.grandTotal,
        currency: pricing.currency,
      },
    });

    res.status(200).json(pricing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};