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

    const getProducts = await Product.find()
      .where("_id")
      .in(items)
      .where("productType")
      .equals("digital")
      .exec();

    if (getProducts) next();

    let hasDuplicate = items.some((val, i) => items.indexOf(val) !== i);

    if (hasDuplicate) {
      return respondWithError(
        res,
        {},
        "Duplicate product, kindly increase number of your order and delete the duplicate",
        StatusCodes.BAD_REQUEST
      );
    }

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

    let moreThanInvent = [];

    req.body.items.map(async (anItem, index) => {
      const moreRecord = await Product.find()
        .where("_id")
        .in(anItem.id)
        .where("inventory.amount")
        .lt(anItem.unit)
        .exec();
      moreThanInvent.push(...moreRecord);
      if (index === req.body.items.length - 1) {
        if (moreThanInvent.length > 0) {
          const errorObject1 = moreThanInvent.map((err) => ({
            item: err.displayName,
            message: `${err.displayName} unit demanded is more than available stock`,
          }));
          return respondWithError(
            res,
            errorObject1,
            "These items are more than the stock available",
            StatusCodes.BAD_REQUEST
          );
        }
        next();
      }
    });
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};
