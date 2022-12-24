const express = require("express");
const { login, registerStaff } = require("../controllers/Admin/Auth");
const {
  getAllImage,
  addImage,
  deleteImage,
} = require("../controllers/Admin/Media");
const {
  adminCancelOrder,
  adminUpdateOrder,
  adminGetOrder,
  adminQueryOrder,
  adminQueryOrderByProduct,
} = require("../controllers/Admin/Order");
const {
  addProduct,
  addCategory,
  getCategoryDetail,
  editCategory,
} = require("../controllers/Admin/Product");
const {
  adminQueryUser,
  adminGetUsers,
  adminGetStaff,
} = require("../controllers/Admin/User");
const { adminMiddle } = require("../middleware/adminMiddle");
const { MultiPhotoConverter } = require("../middleware/MultiPhotoConverter");

const router = express.Router();

// todo: auth
router.route("/auth/login").post(login);
router.route("/auth/staff").post(adminMiddle, registerStaff);

// todo: user
router.route("/user").get(adminMiddle, adminGetUsers);
router.route("/user/:id").get(adminMiddle, adminQueryUser);
router.route("/staff").get(adminMiddle, adminGetStaff);
router.route("/staff/:id").get(adminMiddle, adminQueryUser);

// todo: product and catogory
router.post("/category/add", adminMiddle, addCategory);
router.post("/product/add", adminMiddle, MultiPhotoConverter, addProduct);
router
  .route("/category/:slug")
  .get(adminMiddle, getCategoryDetail)
  .patch(adminMiddle, editCategory);

//todo: order
router.route("/order/").get(adminMiddle, adminGetOrder);
router.route("/order/:id").get(adminMiddle, adminQueryOrder);
router.route("/order/cancel").patch(adminMiddle, adminCancelOrder);
router.route("/order/:id/update").patch(adminMiddle, adminUpdateOrder);
router.route("/order/product/:id").get(adminMiddle, adminQueryOrderByProduct);

// todo: media
router
  .route("/media")
  .get(adminMiddle, getAllImage)
  .post(adminMiddle, addImage)
  .delete(adminMiddle, deleteImage);

module.exports = router;
