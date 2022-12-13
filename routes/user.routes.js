const express = require("express");
const { profile } = require("../controllers/UserController");
const { authMiddle } = require("../middleware/authMiddle");
const router = express.Router();

router.route("/me").get(authMiddle, profile);

module.exports = router;
