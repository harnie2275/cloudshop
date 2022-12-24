const { StatusCodes } = require("http-status-codes");
const Category = require("../models/Category");
const Product = require("../models/Product");
const User = require("../models/User");
const cloudinary = require("../utils/image/upload");
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
    const { page, perPage, sort } = req.query;

    const limit = perPage !== undefined ? perPage : 12;
    const pageFall = page !== undefined ? page - 1 : 0;
    const DocCount = await Product.find();
    const allProduct = await Product.find()
      .limit(limit)
      .skip(limit * pageFall);

    if (sort) {
      switch (sort) {
        case "low-high": {
          const sortedProduct = await Product.find()
            .sort("amount")
            .limit(limit)
            .skip(limit * pageFall);
          return respondWithSuccess(
            res,
            { queriedProduct: sortedProduct, totalDoc: DocCount.length },
            "Sorted successfully",
            StatusCodes.OK
          );
        }
        case "high-low": {
          const sortedProduct = await Product.find()
            .sort("-amount")
            .limit(limit)
            .skip(limit * pageFall);
          return respondWithSuccess(
            res,
            { queriedProduct: sortedProduct, totalDoc: DocCount.length },
            "Sorted successfully",
            StatusCodes.OK
          );
        }
        case "latest": {
          const sortedProduct = await Product.find()
            .sort("-updatedAt")
            .limit(limit)
            .skip(limit * pageFall);
          return respondWithSuccess(
            res,
            { queriedProduct: sortedProduct, totalDoc: DocCount.length },
            "Sorted successfully",
            StatusCodes.OK
          );
        }
        default:
          return respondWithSuccess(
            res,
            { queriedProduct: allProduct, totalDoc: DocCount.length },
            "Sorted product fetched successfully",
            StatusCodes.OK
          );
      }
    }
    return respondWithSuccess(
      res,
      { queriedProduct: allProduct, totalDoc: DocCount.length },
      "Sorted product fetched successfully",
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
    const { category, sort, page, perPage } = req.query;

    const limit = perPage !== undefined ? perPage : 12;
    const pageFall = page !== undefined ? page - 1 : 0;

    const DocCount = await Product.find({
      "productCategory.stream": category,
    });

    const queriedProduct = await Product.find({
      "productCategory.stream": category,
    })
      .limit(limit)
      .skip(limit * pageFall);

    if (sort) {
      switch (sort) {
        case "low-high": {
          const sortedProduct = await Product.find({
            "productCategory.stream": category,
          })
            .sort("amount")
            .limit(limit)
            .skip(limit * pageFall);
          return respondWithSuccess(
            res,
            { queriedProduct: sortedProduct, totalDoc: DocCount.length },
            "Sorted successfully",
            StatusCodes.OK
          );
        }
        case "high-low": {
          const sortedProduct = await Product.find({
            "productCategory.stream": category,
          })
            .sort("-amount")
            .limit(limit)
            .skip(limit * pageFall);
          return respondWithSuccess(
            res,
            { queriedProduct: sortedProduct, totalDoc: DocCount.length },
            "Sorted successfully",
            StatusCodes.OK
          );
        }
        case "latest": {
          const sortedProduct = await Product.find({
            "productCategory.stream": category,
          })
            .sort("-updatedAt")
            .limit(limit)
            .skip(limit * pageFall);
          return respondWithSuccess(
            res,
            { queriedProduct: sortedProduct, totalDoc: DocCount.length },
            "Sorted successfully",
            StatusCodes.OK
          );
        }
        default:
          return respondWithSuccess(
            res,
            { queriedProduct: queriedProduct, totalDoc: DocCount.length },
            "Sorted product fetched successfully",
            StatusCodes.OK
          );
      }
    }

    respondWithSuccess(
      res,
      { queriedProduct, totalDoc: DocCount.length },
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
    respondWithSuccess(
      res,
      allCategory,
      "Category has been fetched",
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

exports.productQuery = async (req, res, next) => {
  try {
    const { id } = req.query;
    if (!id) {
      if (!id)
        return respondWithError(
          res,
          {},
          "product id was not found",
          StatusCodes.BAD_REQUEST
        );
    }
    const product = await Product.findOne({ _id: id });
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

exports.addProductReview = async (req, res, next) => {
  try {
    const { comment, rating } = req.body;
    const { id } = req.params;
    if (!comment || !rating)
      return respondWithError(
        res,
        {},
        "comment and rating are required",
        StatusCodes.BAD_REQUEST
      );
    const product = await Product.findById(id);
    if (!product)
      return respondWithError(
        res,
        {},
        "no product was found",
        StatusCodes.BAD_REQUEST
      );

    product.review = product.review.filter(
      (aReview) => aReview.user !== req.id
    );
    product.rating = product.rating.filter(
      (aReview) => aReview.user !== req.id
    );
    const review = {
      user: req.id,
      comment: comment,
    };
    product.review = [...product.review, review];
    product.rating = [...product.rating, { rating: rating, user: req.id }];
    product.save();
    respondWithSuccess(
      res,
      product,
      "Your review has been added",
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};
