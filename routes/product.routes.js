const express = require("express");
const {
  allCategory,
  addCategory,
  addProduct,
  queryProduct,
  productQuery,
  allProduct,
} = require("../controllers/ProductController");
const { authMiddle } = require("../middleware/authMiddle");
const { MultiPhotoConverter } = require("../middleware/MultiPhotoConverter");
const router = express.Router();

router.route("/category").get(allCategory).post(authMiddle, addCategory);
router.post("/add", authMiddle, MultiPhotoConverter, addProduct);
router.get("/all", queryProduct);
router.get("/item", productQuery);
router.get("/", allProduct);

module.exports = router;
