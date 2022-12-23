const express = require("express");
const { updateAccount } = require("../controllers/AuthController");
const {
  fundWallet,
  accountBalance,
} = require("../controllers/TransactionController");
const { profile } = require("../controllers/UserController");
const { authMiddle } = require("../middleware/authMiddle");
const router = express.Router();

router.route("/me").get(authMiddle, profile);
router.post("/update", authMiddle, updateAccount);
router.post("/fundWallet", authMiddle, fundWallet);
router.get("/walletBalance", authMiddle, accountBalance);

module.exports = router;
