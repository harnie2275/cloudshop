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
    const { page, perPage } = req.query;

    const limit = perPage !== undefined ? perPage : 12;
    const pageFall = page !== undefined ? page - 1 : 0;
    const totalDoc = await Product.find();
    const allProduct = await Product.find()
      .limit(limit)
      .skip(limit * pageFall);

    respondWithSuccess(
      res,
      { queriedProduct: allProduct, totalDoc: totalDoc.length },
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
          const sortedProduct = queriedProduct.sort(
            (a, b) => a.amount - b.amount
          );
          return respondWithSuccess(
            res,
            sortedProduct,
            "Sorted successfully",
            StatusCodes.OK
          );
        }
        case "high-low": {
          const sortedProduct = queriedProduct.sort(
            (a, b) => b.amount - a.amount
          );
          return respondWithSuccess(
            res,
            sortedProduct,
            "Sorted successfully",
            StatusCodes.OK
          );
        }
        // case "rating": {
        //   const sortedProduct = queriedProduct.sort(
        //     (a, b) =>
        //       b.rating.reduce((bc, bd) => bc + bd) -
        //       a.rating.reduce((ac, ad) => ac + ad)
        //   );
        //   return respondWithSuccess(
        //     res,
        //     sortedProduct,
        //     "Sorted successfully",
        //     StatusCodes.OK
        //   );
        // }
        case "latest": {
          const sortedProduct = queriedProduct.sort(
            (a, b) => b.createdAt - a.createdAt
          );
          return respondWithSuccess(
            res,
            sortedProduct,
            "Sorted successfully",
            StatusCodes.OK
          );
        }
        default:
          return respondWithSuccess(
            res,
            queriedProduct,
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
