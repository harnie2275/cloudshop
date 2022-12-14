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
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Category",
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
    },
    shippingFee: {
      type: Number,
      required: [true, "Shipping Fee is required"],
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
  },
  {
    timestamps: true,
  }
);

const Product = model("Product", ProductSchema);

module.exports = Product;
