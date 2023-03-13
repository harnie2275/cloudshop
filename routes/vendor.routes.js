const express = require("express");

const {
  createVendor,
  activateVendor,
  resendVendorActivationLink,
} = require("../controllers/Vendor/Auth");
const { vendorMiddleware } = require("../middleware/vendorMiddleware");

const router = express.Router();

router.post("/auth/create", createVendor);
router.get("/auth/activate", activateVendor);
router.get("/auth/resend-activation-link", [
  vendorMiddleware,
  resendVendorActivationLink,
]);

module.exports = router;
