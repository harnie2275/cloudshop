const { StatusCodes } = require("http-status-codes");
const Product = require("../../models/Product");
const Vendor = require("../../models/Vendor/Vendor");
const {
  respondWithSuccess,
  respondWithError,
} = require("../../utils/response");

exports.vendorAddProduct = async (req, res, next) => {
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
};

exports.allVendorProducts = async (req, res, next) => {
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
};

exports.vendorSearchProduct = async (req, res, next) => {
  const vendor = req.vendor;

  const searchQuery = (req.query.q || "").toLowerCase();
  const searchBy = req.query?.searchBy || null;
  const filter = req.query.filter || "";
  const expressionType = JSON.parse(req.query.expr);
  let isInteger = expressionType.some((a) => ["number", "float"].includes(a));
  const regexFilterParam = {
    contains: {
      [searchBy]: new RegExp(searchQuery, "i"),
    },
    starts_with: {
      [searchBy]: new RegExp("^" + searchQuery, "i"),
    },
    is: {
      [searchBy]: req.query.q,
    },
    is_i: {
      [searchBy]: isInteger
        ? parseFloat(req.query.q || 0)
        : new RegExp("^" + searchQuery + "$", "i"),
    },
    is_gt: {
      [searchBy]: isInteger ? { $gt: parseFloat(req.query.q) } : "",
    },
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
