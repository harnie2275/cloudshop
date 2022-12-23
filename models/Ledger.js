const { Schema, model } = require("mongoose");

const LedgerSchema = new Schema(
  {
    CLDX: {
      type: Number,
      default: 0,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const Ledger = model("Ledger", LedgerSchema);

module.exports = Ledger;
