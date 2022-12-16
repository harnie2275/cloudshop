const express = require("express");
const {
  placeOrder,
  userCancelOrder,
  adminUpdateOrder,
  adminCancelOrder,
  myOrder,
} = require("../controllers/OrderController");
const { authMiddle } = require("../middleware/authMiddle");
const { validateInventry } = require("../middleware/validateInventory");
const router = express.Router();

router.route("/placeOrder").post(authMiddle, validateInventry, placeOrder);
router.route("/:id/cancel").patch(authMiddle, userCancelOrder);
router.route("/:id/admin/cancel").patch(authMiddle, adminCancelOrder);
router.route("/:id/admin/update").patch(authMiddle, adminUpdateOrder);
router.route("/me").get(authMiddle, myOrder);

module.exports = router;
