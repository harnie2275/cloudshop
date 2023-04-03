const express = require("express");
const { uploadData } = require("../controllers/Vendor/Verification");
const router = express.Router();
const { vendorMiddleware } = require("../middleware/vendorMiddleware");

router.post("/callback", function (req, res, next) {
    console.log(req.body);
});

router.post("/upload-data", uploadData );


module.exports = router;
