const { StatusCodes } = require("http-status-codes");
const Product = require("../../models/Product");
const Vendor = require("../../models/Vendor/Vendor");
const {
  respondWithSuccess,
  respondWithError,
} = require("../../utils/response");
const { productValidator } = require("../../utils/validator");

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
