const express = require("express");
const router = express.Router();
const { vendorMiddleware } = require("../middleware/vendorMiddleware");


router.post("/callback", function (req, res, next) {
    console.log(req.body);
});

router.post("/upload-data", );


module.exports = router;
