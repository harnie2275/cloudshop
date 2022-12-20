const express = require("express");
const { login } = require("../controllers/Admin/Auth");
const {
  adminCancelOrder,
  adminUpdateOrder,
  adminGetOrder,
  adminQueryOrder,
} = require("../controllers/Admin/Order");
const { addProduct, addCategory } = require("../controllers/Admin/Product");
const { adminMiddle } = require("../middleware/adminMiddle");
const { MultiPhotoConverter } = require("../middleware/MultiPhotoConverter");

const router = express.Router();

// todo: auth
router.route("/auth/login").post(login);

// todo: product and catogory
router.post("/category/add", adminMiddle, addCategory);
router.post("/product/add", adminMiddle, MultiPhotoConverter, addProduct);

//todo: order
router.route("/order/").get(adminMiddle, adminGetOrder);
router.route("/order/:id").get(adminMiddle, adminQueryOrder);
router.route("/order/cancel").patch(adminMiddle, adminCancelOrder);
router.route("/order/:id/update").patch(adminMiddle, adminUpdateOrder);

module.exports = router;
