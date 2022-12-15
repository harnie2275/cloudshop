const { StatusCodes } = require("http-status-codes");
const randomize = require("randomatic");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { respondWithError, respondWithSuccess } = require("../utils/response");
const { orderValidator } = require("../utils/validator");

/**
 *
 * @param {{
 * orderId: string;
 * billingAddress: object;
 * user: string;
 * totalAmount: number;
 * items: [];
 * }} req.body
 * @param {*} res
 * @param {*} next
 */
exports.placeOrder = async (req, res, next) => {
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
    //check for item unit and inventory
    req.body.items.map(async (anItem) => {
      await validateInventory(anItem).then(async (res) => {
        if (res.error === true) {
          return respondWithError(
            res,
            {},
            res.error.message,
            StatusCodes.BAD_REQUEST
          );
        }
        const restructedObj = { orderId: randomize("0", 8), ...req.body };
        const newOrder = await Order.create({ ...restructedObj });
        if (!newOrder)
          return respondWithError(
            res,
            {},
            newOrder.message,
            StatusCodes.BAD_REQUEST
          );
        /**
         * @param {*} updateInventory
         */
        // newOrder.items.map(async (anItem) => {
        //   await updateInventory(anItem, "reduce").then((result) => {
        //     if (result.error === true)
        //       return respondWithError(
        //         res,
        //         {},
        //         result.error.message,
        //         StatusCodes.BAD_REQUEST
        //       );
        //     respondWithSuccess(
        //       res,
        //       newOrder,
        //       "Your order has been placed",
        //       StatusCodes.OK
        //     );
        //     /**
        //      * @returns send order mail for placement of order and all necessary details
        //      */
        //   });
        // });
      });
    });
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

const validateInventory = async (item) => {
  try {
    const product = await Product.findById(item.id);
    if (product.inventory.amount < 1) {
      return { error: true, message: `${product.displayName} is out of stock` };
    }
    return;
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const updateInventory = async (item, action) => {
  try {
    const product = await Product.findById(item?.id);
    await Product.findByIdAndUpdate(item?.id, {
      "inventory.amount":
        action === "reduce"
          ? product?.inventory?.amount - item?.unit
          : product?.inventory?.amount + item?.unit,
      "inventory.availability":
        action === "reduce" && product.inventory.amount - item?.unit < 1
          ? "out-of-stock"
          : "in-stock",
    });
    return;
  } catch (error) {
    return { error: true, message: error.message };
  }
};
