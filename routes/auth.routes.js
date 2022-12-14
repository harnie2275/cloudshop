const express = require("express");
const {
  register,
  login,
  activateAccount,
  resendActivateLink,
  resetPasswordLink,
  resetPassword,
} = require("../controllers/AuthController");
const { authMiddle } = require("../middleware/authMiddle");
const router = express.Router();

router.route("/register").post(register);
router.post("/login", login);
router.get("/activate", activateAccount);
router.get("/resendLink", authMiddle, resendActivateLink);
router.post("/resetPasswordLink", resetPasswordLink);
router.post("/resetPassword", resetPassword);

module.exports = router;
