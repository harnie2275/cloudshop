const { Schema, model } = require("mongoose");

const TransactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      select: false,
    },
    trnxRef: {
      type: String,
      required: true,
      unique: true,
    },
    activity: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = model("Transaction", TransactionSchema);

module.exports = Transaction;
