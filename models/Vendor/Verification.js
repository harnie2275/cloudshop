const mongoose = require("mongoose");

const VerificationSchema = new mongoose.Schema(
  {
    vendor_id: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    verification_type: {
      enum: ["drivers license", "id card", "voters card", "passport"],
      type: String,
      required: true,
    },
    document_images: {
      type: [String],
      default: [],
    },
    selfie_image: {
      type: String,
    },
    status: {
      enum: ["pending", "processing", "failed", "verified"],
      type: String,
      default: "pending",
    },
    admin_seen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Verification", VerificationSchema);
