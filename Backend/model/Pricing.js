import mongoose from "mongoose";

const lineItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true, default: 0 },
  isOptional: { type: Boolean, default: false }, // Client can opt in/out
  isSelected: { type: Boolean, default: true },
});

const pricingSchema = new mongoose.Schema(
  {
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
      unique: true, // One pricing table per proposal
    },
    pricingType: {
      type: String,
      enum: ["fixed", "milestone", "recurring", "hourly"],
      default: "fixed",
    },
    currency: {
      type: String,
      default: "USD",
    },
    items: [lineItemSchema],
    discount: {
      type: { type: String, enum: ["percentage", "fixed"], default: "fixed" },
      value: { type: Number, default: 0 },
    },
    taxRate: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-calculate totals
pricingSchema.pre("save", function (next) {
  this.items.forEach((item) => {
    item.amount = item.quantity * item.unitPrice;
  });

  this.subtotal = this.items
    .filter((item) => item.isSelected)
    .reduce((sum, item) => sum + item.amount, 0);

  let discountVal = 0;
  if (this.discount.type === "percentage") {
    discountVal = (this.subtotal * this.discount.value) / 100;
  } else {
    discountVal = this.discount.value;
  }

  const taxableAmount = Math.max(0, this.subtotal - discountVal);
  this.taxAmount = (taxableAmount * (this.taxRate || 0)) / 100;
  this.grandTotal = taxableAmount + this.taxAmount;

  next();
});

export default mongoose.model("Pricing", pricingSchema);