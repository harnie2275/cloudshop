const express = require("express");
const { placeOrder } = require("../controllers/OrderController");
const { authMiddle } = require("../middleware/authMiddle");
const { validateInventry } = require("../middleware/validateInventory");
const router = express.Router();

router.route("/placeOrder").post(authMiddle, validateInventry, placeOrder);

module.exports = router;
