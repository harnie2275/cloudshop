const express = require("express");
const { adminQueryUser } = require("../controllers/Admin/User");

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
const { analytics } = require("../controllers/Vendor/Metrics");
const {
  getVendorOrders,
  vendorUpdateOrder,
  vendorGetSingleOrder,
  vendorSearchOrders,
} = require("../controllers/Vendor/Order");
const {
  vendorAddProduct,
  allVendorProducts,
  vendorSearchProduct,
  vendorGetOneProduct,
} = require("../controllers/Vendor/Product");
const { getVendor, updateVendor } = require("../controllers/Vendor/User");
const {
  vendorMiddleware,
  vendorIdentityMiddleware,
} = require("../middleware/vendorMiddleware");

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
router.post("/product/add", [
  vendorMiddleware,
  vendorIdentityMiddleware,
  vendorAddProduct,
]);
router.get("/product", [vendorMiddleware, allVendorProducts]);
router.get("/product/search", [vendorMiddleware, vendorSearchProduct]);
router.get("/product/:id", [vendorMiddleware, vendorGetOneProduct]);

// Order
router.get("/orders/search", [vendorMiddleware, vendorSearchOrders]);
router.get("/orders", [vendorMiddleware, getVendorOrders]);
router.put("/orders/:id", [vendorMiddleware, vendorUpdateOrder]);
router.get("/orders/:id", [vendorMiddleware, vendorGetSingleOrder]);

// User
router.get("/user/:id", [vendorMiddleware, adminQueryUser]);

// Media
router.get("/media", [vendorMiddleware, getAllVendorImages]);
router.post("/media/add", [
  vendorMiddleware,
  vendorIdentityMiddleware,
  addVendorImage,
]);

// Analytics
router.get("/analytics", [vendorMiddleware, analytics]);

module.exports = router;
