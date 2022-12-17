const express = require("express");
const { updateAccount } = require("../controllers/AuthController");
const { profile } = require("../controllers/UserController");
const { authMiddle } = require("../middleware/authMiddle");
const router = express.Router();

router.route("/me").get(authMiddle, profile);
router.post("/update", authMiddle, updateAccount);

module.exports = router;
