const express = require("express");
const { placeOrder } = require("../controllers/OrderController");
const { authMiddle } = require("../middleware/authMiddle");
const router = express.Router();

router.route("/placeOrder").post(authMiddle, placeOrder);

module.exports = router;
