const express = require("express");
const { login } = require("../controllers/Admin/Auth");
const {
  adminCancelOrder,
  adminUpdateOrder,
  adminGetOrder,
  adminQueryOrder,
  adminQueryOrderByProduct,
} = require("../controllers/Admin/Order");
const { addProduct, addCategory } = require("../controllers/Admin/Product");
const { adminQueryUser, adminGetUsers } = require("../controllers/Admin/User");
const { adminMiddle } = require("../middleware/adminMiddle");
const { MultiPhotoConverter } = require("../middleware/MultiPhotoConverter");

const router = express.Router();

// todo: auth
router.route("/auth/login").post(login);

// todo: user
router.route("/user").get(adminMiddle, adminGetUsers);
router.route("/user/:id").get(adminMiddle, adminQueryUser);

// todo: product and catogory
router.post("/category/add", adminMiddle, addCategory);
router.post("/product/add", adminMiddle, MultiPhotoConverter, addProduct);

//todo: order
router.route("/order/").get(adminMiddle, adminGetOrder);
router.route("/order/:id").get(adminMiddle, adminQueryOrder);
router.route("/order/cancel").patch(adminMiddle, adminCancelOrder);
router.route("/order/:id/update").patch(adminMiddle, adminUpdateOrder);
router.route("/order/product/:id").get(adminMiddle, adminQueryOrderByProduct);

module.exports = router;
