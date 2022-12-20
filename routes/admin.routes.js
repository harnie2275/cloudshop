const express = require("express");
const { login } = require("../controllers/Admin/Auth");
const {
  adminCancelOrder,
  adminUpdateOrder,
  adminGetOrder,
} = require("../controllers/Admin/Order");
const { addProduct, addCategory } = require("../controllers/Admin/Product");
const { authMiddle } = require("../middleware/authMiddle");
const { MultiPhotoConverter } = require("../middleware/MultiPhotoConverter");

const router = express.Router();

// todo: auth
router.route("/auth/login").post(login);

// todo: product and catogory
router.route("/category/add").post(authMiddle, addCategory);
router.post("/product/add", authMiddle, MultiPhotoConverter, addProduct);

//todo: order
router.route("/order/").get(authMiddle, adminGetOrder);
router.route("/order/cancel").patch(authMiddle, adminCancelOrder);
router.route("/order/:id/update").patch(authMiddle, adminUpdateOrder);

module.exports = router;
