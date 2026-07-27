import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
  {
    // --- OWNERSHIP & ASSOCIATIONS ---
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Proposal must belong to a user"],
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company details are required"],
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client details are required"],
    },
    templateUsed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      default: null, // Track if built from a specific template
    },

    // --- IDENTIFIER & META ---
    title: {
      type: String,
      required: [true, "Proposal title is required"],
      trim: true,
    },
    proposalNumber: {
      type: String,
      required: true,
      unique: true, // e.g., "PROP-2026-0001"
    },
    status: {
      type: String,
      enum: ["draft", "sent", "viewed", "accepted", "declined", "expired"],
      default: "draft",
      index: true,
    },

    // --- SECURE SHARING & EXPIRATION ---
    shareableToken: {
      type: String,
      unique: true,
      index: true, // Unique token for public viewing link (e.g. /view/proposal/:token)
    },
    validUntil: {
      type: Date, // Expiration date for the offer
    },
    sentAt: Date,
    viewedAt: Date,
    signedAt: Date,

    // --- CONTENT & MODULAR REFERENCES ---
    // Sections are ordered array references to Section model
    sections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
      },
    ],
    // Pricing table reference
    pricing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pricing",
    },
    // External document attachments
    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attachment",
      },
    ],

    // --- QUICK DENORMALIZED TOTALS (For Fast Dashboard Queries) ---
    // Stored here so dashboard lists don't need to populate the full Pricing model
    summaryTotal: {
      subtotal: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      grandTotal: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
    },

    // --- ELECTRONIC SIGNATURE / ACCEPTANCE ---
    signature: {
      signedBy: String,        // Full name typed by client
      signerEmail: String,
      signedAt: Date,
      ipAddress: String,       // Legal compliance tracking
      signatureData: String,   // Base64 image or vector path if drawn
    },

    // --- ANALYTICS & INTERACTION SUMMARY ---
    viewsCount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String, // Private internal notes for the user
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- VIRTUAL REFERENCES (For populated child logs and comments) ---
proposalSchema.virtual("activityLogs", {
  ref: "ActivityLog",
  localField: "_id",
  foreignField: "proposal",
});

proposalSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "proposal",
});

// --- HELPER METHODS ---
// Check if proposal has passed its validity date
proposalSchema.methods.isExpired = function () {
  if (!this.validUntil) return false;
  return new Date() > this.validUntil;
};

export default mongoose.model("Proposal", proposalSchema);