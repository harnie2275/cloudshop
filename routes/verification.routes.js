const express = require("express");
const { uploadData } = require("../controllers/Vendor/Verification");
const { vendorMiddleware } = require("../middleware/vendorMiddleware");

const router = express.Router();

router.post("/callback", function (req, res, next) {
    console.log(req.body);
});

router.post("/upload-data", vendorMiddleware, uploadData);


module.exports = router;
