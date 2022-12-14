const { StatusCodes } = require("http-status-codes");
const Category = require("../models/Category");
const Product = require("../models/Product");
const User = require("../models/User");
const { respondWithError, respondWithSuccess } = require("../utils/response");
const { productValidator } = require("../utils/validator");

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns all product from database
 */
exports.allProduct = async (req, res, next) => {
  try {
    const allProduct = await Product.find();
    respondWithSuccess(
      res,
      allProduct,
      "All product fetched successfully",
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns all product under a given category
 */
exports.queryProduct = async (req, res, next) => {
  try {
    const { category } = req.query;
    const queriedProduct = await Product.find({ productCategory: category });
    respondWithSuccess(
      res,
      queriedProduct,
      "Product has been fetched",
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns all category with their subCategories
 */
exports.allCategory = async (req, res, next) => {
  try {
    const allCategory = await Category.find();
    respondWithError(
      res,
      allCategory,
      "Category has been fetched",
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

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
    if (user.role !== "admin" || user.role !== "sale rep")
      return respondWithError(
        res,
        {},
        "Your are not authorized to upload product",
        StatusCodes.UNAUTHORIZED
      );
    const { error } = productValidator(req.body);
    if (error) {
      return respondWithError(
        res,
        {},
        error.details?.[0].message,
        StatusCodes.BAD_REQUEST
      );
    }
    const addedProduct = await Product.create({ ...req.body });
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
    if (user.role !== "admin" || user.role !== "sale rep")
      return respondWithError(
        res,
        {},
        "Your are not authorized to upload product",
        StatusCodes.UNAUTHORIZED
      );
    const addedCategory = await Category.create({ ...req.body });
    if (!addedCategory)
      return respondWithError(
        res,
        {},
        addedCategory?.message,
        StatusCodes.BAD_REQUEST
      );
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

exports.productQuery = async (req, res, next) => {
  try {
    const { id, name } = req.query;
    if (!id || !name) {
      if (!id)
        return respondWithError(
          res,
          {},
          "product id was not found",
          StatusCodes.BAD_REQUEST
        );
      if (!name)
        return respondWithError(
          res,
          {},
          "product name not found",
          StatusCodes.BAD_REQUEST
        );
    }
    const product = await Product.findOne({ _id: id, displayName: name });
    if (!product)
      return respondWithError(
        res,
        {},
        "product not found",
        StatusCodes.BAD_REQUEST
      );
    respondWithSuccess(
      res,
      product,
      "product has been fetched",
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};
