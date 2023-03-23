const express = require("express");

const {
  createVendor,
  activateVendor,
  resendVendorActivationLink,
  vendorLogin,
  vendorResetPasswordLink,
  vendorResetPassword,
} = require("../controllers/Vendor/Auth");
const {
  addVendorImage,
  getAllVendorImages,
} = require("../controllers/Vendor/Media");
const { getVendorOrders } = require("../controllers/Vendor/Order");
const {
  vendorAddProduct,
  allVendorProducts,
  vendorSearchProduct,
  vendorGetOneProduct,
} = require("../controllers/Vendor/Product");
const { getVendor, updateVendor } = require("../controllers/Vendor/User");
const { vendorMiddleware } = require("../middleware/vendorMiddleware");

const router = express.Router();

// Authentication
router.post("/auth/create", createVendor);
router.get("/auth/activate", activateVendor);
router.get("/auth/resend-activation-link", [
  vendorMiddleware,
  resendVendorActivationLink,
]);
router.post("/auth/login", vendorLogin);
router.post("/auth/send-reset-token", vendorResetPasswordLink);
router.post("/auth/reset-password", vendorResetPassword);

// Vendor profile
router.get("/user/me", [vendorMiddleware, getVendor]);
router.put("/user/update", [vendorMiddleware, updateVendor]);

// Product
router.post("/product/add", [vendorMiddleware, vendorAddProduct]);
router.get("/product", [vendorMiddleware, allVendorProducts]);
router.get("/product/search", [vendorMiddleware, vendorSearchProduct]);
router.get("/product/:id", [vendorMiddleware, vendorGetOneProduct]);

// Order
router.get("/orders", [vendorMiddleware, getVendorOrders]);

// Media
router.get("/media", [vendorMiddleware, getAllVendorImages]);
router.post("/media/add", [vendorMiddleware, addVendorImage]);
module.exports = router;
