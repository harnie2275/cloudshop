const { StatusCodes } = require("http-status-codes");
const Category = require("../../models/Category");
const Product = require("../../models/Product");
const User = require("../../models/User");
const cloudinary = require("../../utils/image/upload");
const {
  respondWithError,
  respondWithSuccess,
} = require("../../utils/response");
const { productValidator } = require("../../utils/validator");

/**
 *
 * @param {{
 * displayName: string;
 * amount: number;
 * productCategory: string;
 * productImage: string;
 * catchPhrase: string;
 * productType: string;
 * SKU: string;
 * inventory: object;
 * shippingFee: string;
 * }} req.body required fields to create a database
 * @param {*} res
 * @param {*} next
 * @returns an added product which checks all required fields
 */
exports.addProduct = async (req, res, next) => {
  try {
    const user = await User.findById(req.id);

    if (["marketing", "editor", "user"].includes(user.role)) {
      respondWithError(
        res,
        {},
        "Your are not authorized to upload product",
        StatusCodes.UNAUTHORIZED
      );
      return;
    }
    const { error } = productValidator(req.body);
    if (error) {
      return respondWithError(
        res,
        {},
        error.details?.[0].message,
        StatusCodes.BAD_REQUEST
      );
    }
    const { productCategory } = req.body;
    if (
      productCategory !== undefined &&
      productCategory.wordPhrase.length < 1
    ) {
      respondWithError(
        res,
        {},
        "Kindly provide a category",
        StatusCodes.BAD_REQUEST
      );
      return;
    }

    const productImageURL =
      req.body.productImage.substring(0, 4) !== "http" &&
      (await cloudinary.uploader.upload(req.body.productImage, {
        folder: "products",
      }));
    const newObj = {
      ...req.convertedBody,
      productImage:
        req.body.productImage.substring(0, 4) !== "http"
          ? productImageURL.secure_url
          : req.body.productImage,
    };

    const addedProduct = await Product.create({ ...newObj });
    addedProduct.save();
    respondWithSuccess(
      res,
      addedProduct,
      "Product has been added",
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

/**
 *
 * @param {{
 * name: string;
 * }} req.body required fields to create a category
 * @param {*} res
 * @param {*} next
 * @returns an added category which checks all required fields
 */
exports.addCategory = async (req, res, next) => {
  try {
    const user = await User.findById(req.id);
    if (["marketing", "editor", "user"].includes(user.role)) {
      respondWithError(
        res,
        {},
        "Your are not authorized to upload product",
        StatusCodes.UNAUTHORIZED
      );
      return;
    }
    const body = req.body;
    const thumbnailURL =
      body?.thumbnail !== undefined &&
      body?.thumbnail.substring(0, 4) !== "http" &&
      (await cloudinary.uploader.upload(req.body.thumbnail, {
        folder: "categories",
      }));

    const newObj =
      req.body.thumbnail && body?.thumbnail.substring(0, 4) !== "http"
        ? { ...body, thumbnail: thumbnailURL.secure_url }
        : req.body;

    const addedCategory = await Category.create({ ...newObj });
    if (!addedCategory)
      return respondWithError(
        res,
        {},
        addedCategory?.message,
        StatusCodes.BAD_REQUEST
      );
    /***
     * @returns update parent category if any;
     */
    if (addedCategory.parentCategory !== undefined) {
      const upStreamCategory = await Category.findOne({
        wordPhrase: addedCategory.parentCategory.wordPhrase,
      });
      if (!upStreamCategory)
        return respondWithError(
          res,
          {},
          "Category was added but could not find parent category",
          StatusCodes.BAD_REQUEST
        );
      upStreamCategory.subItem = [
        ...upStreamCategory.subItem,
        { name: addedCategory.name, wordPhrase: addedCategory.wordPhrase },
      ];
      upStreamCategory.save();
    }
    addedCategory.save();
    respondWithSuccess(
      res,
      addedCategory,
      "Category has been added",
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

exports.getCategoryDetail = async (req, res, next) => {
  try {
    const category = await Category.findOne({ wordPhrase: req.params.slug });
    if (!category)
      return respondWithError(
        res,
        {},
        "no category found",
        StatusCodes.BAD_REQUEST
      );
    respondWithSuccess(
      res,
      category,
      "category detail fetched successfully",
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

exports.editCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ wordPhrase: req.params.slug });
    if (!category)
      return respondWithError(
        res,
        {},
        "no category found",
        StatusCodes.BAD_REQUEST
      );
    if (Object.keys(req.body).includes("wordPhrase"))
      return respondWithError(
        res,
        {},
        "slug cannot be changed",
        StatusCodes.BAD_REQUEST
      );
    Object.entries(req.body).forEach((anAction, item) => {
      category[anAction[0]] = anAction[1];
      if (item === Object.entries(req.body).length - 1) {
        category.save();
        respondWithSuccess(
          res,
          updatedOrder,
          "order has been updated",
          StatusCodes.OK
        );
      }
    });
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};
