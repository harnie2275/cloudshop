const express = require("express");

const {
  createVendor,
  activateVendor,
  resendVendorActivationLink,
  vendorLogin,
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

module.exports = router;
