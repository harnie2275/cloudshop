const { Schema, model } = require("mongoose");

const OrderSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "processing",
        "cancel",
        "delivered",
        "out for delivery",
        "confirmed",
      ],
      default: "processing",
    },
    billingAddress: {
      type: Object,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    totalShippingFee: {
      type: Number,
    },
    /**
     * @description paymentRef covers card payment ref,cash payment code and cldx transaction hash for tracking
     */
    paymentRef: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Order = model("Order", OrderSchema);

module.exports = Order;
