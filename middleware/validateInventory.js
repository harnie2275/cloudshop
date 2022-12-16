const { StatusCodes } = require("http-status-codes");
const Product = require("../models/Product");
const { respondWithError, respondWithSuccess } = require("../utils/response");
const { orderValidator } = require("../utils/validator");

exports.validateInventry = async (req, res, next) => {
  try {
    const { error } = orderValidator(req.body);
    if (error) {
      return respondWithError(
        res,
        {},
        error.details?.[0].message,
        StatusCodes.BAD_REQUEST
      );
    }
    const items = req.body.items.map((anItem) => anItem.id);
    const records = await Product.find()
      .where("_id")
      .in(items)
      .where("inventory.amount")
      .lt(1)
      .exec();

    if (records.length >= 1) {
      const errorObject = records.map((err) => ({
        item: err.displayName,
        message: `${err.displayName} is out of stock`,
      }));
      return respondWithError(
        res,
        errorObject,
        "These items are out of stock",
        StatusCodes.BAD_REQUEST
      );
    }
    next();
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};
