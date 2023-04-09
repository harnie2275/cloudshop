const express = require("express");
const { uploadData } = require("../controllers/Vendor/Verification");
const { vendorMiddleware } = require("../middleware/vendorMiddleware");
const {
  VerificationDocumentConverter,
} = require("../middleware/MultiPhotoConverter");
const {
  uploadManualVerificationData,
} = require("../controllers/Vendor/ManualVerification");

const router = express.Router();

router.post("/callback", function (req, res, next) {
  console.log(req.body);
});

router.post("/upload-data", vendorMiddleware, uploadData);

// Manual verification
router.post(
  "/upload-data/manual",
  vendorMiddleware,
  VerificationDocumentConverter,
  uploadManualVerificationData
);

module.exports = router;
