const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_LIFETIME } = require("../../config/env");

const schemaPlugin = require("mongoose-unique-validator");

const Vendor = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "First name is required"],
      min: 3,
      trim: true,
    },
    lastname: {
      type: String,
      required: [true, "Last name is required"],
      min: 3,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email address already exist"],
    },
    password: {
      type: String,
      min: 8,
      select: false,
      required: [true, "Password is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      unique: [
        true,
        "This phone number is already associated with another user, please try another one",
      ],
      min: 11,
    },
    role: {
      type: String,
      default: "vendor",
      select: false,
    },
    store: {
      name: {
        type: String,
        default: "",
        required: [true, "Store name is required"],
      },
      address: {
        type: String,
        default: "",
        required: [true, "Store address is required"],
      },
      is_verified: {
        type: Boolean,
        default: false,
      },
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

Vendor.plugin(schemaPlugin, { message: "{VALUE} already exists" });
Vendor.methods.generateToken = function () {
  const token = jwt.sign({ userId: this._id, email: this.email }, JWT_SECRET, {
    expiresIn: JWT_LIFETIME,
  });
  return token;
};
module.exports = mongoose.model("Vendor", Vendor);
