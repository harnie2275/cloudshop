const express = require("express");
const {
  placeOrder,
  userCancelOrder,
  adminUpdateOrder,
  adminCancelOrder,
  myOrder,
  queryOrderById,
} = require("../controllers/OrderController");
const { authMiddle } = require("../middleware/authMiddle");
const { cloudaxPay } = require("../middleware/cloudaxPay");
const { validateInventry } = require("../middleware/validateInventory");
const router = express.Router();

router
  .route("/placeorder")
  .post(authMiddle, validateInventry, cloudaxPay, placeOrder);
router.route("/:id/cancel").patch(authMiddle, userCancelOrder);
// router.route("/:id/admin/cancel").patch(authMiddle, adminCancelOrder);
// router.route("/:id/admin/update").patch(authMiddle, adminUpdateOrder);
router.route("/me").get(authMiddle, myOrder);
router.route("/:id").get(authMiddle, queryOrderById);

module.exports = router;
