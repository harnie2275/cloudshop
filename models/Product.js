const { Schema, model } = require("mongoose");

const ProductSchema = new Schema(
  {
    displayName: {
      type: String,
      required: [true, "Display name is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },
    productCategory: {
      type: Object,
    },
    productImage: {
      type: String,
      required: [true, "Product image is required"],
    },
    detailedDescription: {
      type: String,
    },
    photoGallery: {
      type: Array,
    },
    catchPhrase: {
      type: String,
      required: [true, "Short description is required"],
    },
    productType: {
      type: String,
      enum: ["physical", "digital"],
      required: [true, "Product type is required"],
    },
    SKU: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
    },
    inventory: {
      type: Object,
      required: [true, "Inventory is required"],
      default: { availability: "in-stock", amount: 1 },
    },
    shippingFee: {
      type: Number,
      required: [true, "Shipping Fee is required"],
    },
    file: {
      type: String,
    },
    variation: {
      color: {
        type: Array,
      },
      size: {
        type: Array,
      },
    },
    productTag: {
      type: Array,
    },
    review: {
      type: Array,
    },
    rating: {
      type: Array,
    },
    addedBy: {
      type: String,
      required: true,
      default: "",
    },
    regularPrice: {
      type: Number,
      default: this.amount,
    },
  },
  {
    timestamps: true,
  }
);

const Product = model("Product", ProductSchema);

module.exports = Product;
