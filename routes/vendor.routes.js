const express = require("express");

const {
  createVendor,
  activateVendor,
  resendVendorActivationLink,
  vendorLogin,
  vendorResetPasswordLink,
  vendorResetPassword,
} = require("../controllers/Vendor/Auth");
const { getVendor } = require("../controllers/Vendor/User");
const { vendorMiddleware } = require("../middleware/vendorMiddleware");

const router = express.Router();

router.post("/auth/create", createVendor);
router.get("/auth/activate", activateVendor);
router.get("/auth/resend-activation-link", [
  vendorMiddleware,
  resendVendorActivationLink,
]);

router.get("/user/me", [vendorMiddleware, getVendor]);
router.post("/auth/login", vendorLogin);
router.post("/auth/send-reset-token", vendorResetPasswordLink);
router.post("/auth/reset-password", vendorResetPassword);
module.exports = router;
