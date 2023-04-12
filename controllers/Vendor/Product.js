const { StatusCodes } = require("http-status-codes");
const Product = require("../../models/Product");
const Vendor = require("../../models/Vendor/Vendor");
const asyncHandler = require("express-async-handler");

const {
  respondWithSuccess,
  respondWithError,
} = require("../../utils/response");
const getSearchParams = require("../../utils/getSearchParams");

exports.vendorAddProduct = asyncHandler(async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.vendor?._id);

    // const { error } = productValidator({ ...req.body, addedBy: vendor.id });

    // if (error) {
    //   console.log(error);
    //   return respondWithError(
    //     res,
    //     {},
    //     error.details?.[0].message,
    //     StatusCodes.BAD_REQUEST
    //   );
    // }

    const { productCategory } = req.body;
    if (productCategory && productCategory?.wordPhrase?.length < 1) {
      respondWithError(
        res,
        {},
        "Kindly provide a category",
        StatusCodes.BAD_REQUEST
      );
      return;
    }

    const addedProduct = await Product.create({
      ...req.body,
      addedBy: vendor._id,
    });
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
});

exports.allVendorProducts = asyncHandler(async (req, res, next) => {
  const vendor = req.vendor;
  try {
    const { page, perPage, sort } = req.query;

    const vendorParam = { addedBy: vendor._id };
    const limit = perPage || 12;
    const pageFall = page !== undefined ? page - 1 : 0;
    const DocCount = await Product.find(vendorParam);
    const allProduct = await Product.find(vendorParam)
      .sort("-updatedAt")
      .limit(limit)
      .skip(limit * pageFall);

    if (sort) {
      switch (sort) {
        case "low-high": {
          const sortedProduct = await Product.find(vendorParam)
            .sort("-updatedAt")
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
          const sortedProduct = await Product.find({ vendorParam })
            .sort("-updatedAt")
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
          const sortedProduct = await Product.find(vendorParam)
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
});

exports.vendorSearchProduct = async (req, res, next) => {
  const vendor = req.vendor;

  const { expressionType, filter, isInteger, searchBy, searchQuery } =
    getSearchParams(req);
  const regexFilterParam = {
    // query contains
    contains: {
      [searchBy]: new RegExp(searchQuery, "i"),
    },
    // Query starts with
    starts_with: {
      [searchBy]: new RegExp("^" + searchQuery, "i"),
    },
    // Exact query (Case sensitive)
    is: {
      [searchBy]: req.query.q,
    },
    // Exact query (Case insensitive)
    is_i: {
      [searchBy]: isInteger
        ? parseFloat(req.query.q || 0)
        : new RegExp("^" + searchQuery + "$", "i"),
    },
    // Is greater than  (Numbers)
    is_gt: {
      [searchBy]: isInteger ? { $gt: parseFloat(req.query.q) } : "",
    },
    // Is lesser than  (Numbers)
    is_lt: {
      [searchBy]: isInteger ? { $lt: parseFloat(req.query.q) } : "",
    },
  };

  const searchParams = {
    addedBy: vendor._id,
    ...regexFilterParam[filter],
  };

  console.log(searchParams);
  const searchedProducts = await Product.find(searchParams);

  if (searchedProducts) {
    return respondWithSuccess(res, searchedProducts, "Products searched", 200);
  } else {
    return respondWithError(res, [], "An error occured");
  }
};

exports.vendorGetOneProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = req.vendor;
    if (!id) {
      return respondWithError(
        res,
        {},
        "product id was not found",
        StatusCodes.BAD_REQUEST
      );
    }
    const product = await Product.findOne({ _id: id, addedBy: vendor._id });
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
});

exports.vendorEditProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const data = req.body;

  const vendor = req.vendor;

  const product = await Product.findById(id);

  if (!product) return respondWithError(res, [], "Product not found");

  if (product?.addedBy?.toString() !== vendor?._id?.toString())
    return respondWithError(res, [], "Product not found");
  const updateProduct = await product.update(data);
  // await updateProduct.save();
  if (!updateProduct)
    return respondWithError(res, [], "An error occured while updating product");

  return respondWithSuccess(res, updateProduct, "Product successfully updated");
});
