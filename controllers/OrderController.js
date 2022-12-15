const { StatusCodes } = require("http-status-codes");
const randomize = require("randomatic");
const { validate } = require("../models/Order");
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
    newOrder.items.map(async (anItem) => {
      await updateInventory(anItem, "reduce")
        .then(() => {
          respondWithSuccess(
            res,
            newOrder,
            "Your order has been placed",
            StatusCodes.OK
          );
          /**
           * @returns send order mail for placement of order and all necessary details
           */
        })
        .catch((error) => {
          respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
        });
    });
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
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

/**
 *
 * @param {*} req.body receive an order id whose order status is not delivered or out for delivery from user
 * @param {*} res deny admin right.
 * @param {*} next
 * @returns updateInventory
 */
exports.userCancelOrder = async (req, res, next) => {};
/**
 *
 * @param {*} req.body receive an order id whose order status is not delivered from an admin or sales rep
 * @param {*} res deny user, editor and markerter right.
 * @param {*} next
 * @returns updateInventory
 */
exports.adminCancelOrder = async (req, res, next) => {};

/**
 *
 * @param {*} req.body receive an order id whose order status is not canceled
 * @param {*} res deny user, editor and markerter right.
 * @param {*} next
 * @returns update field or paymentRef for cash on delivery and status
 */
exports.adminUpdateOrder = async (req, res, next) => {};

/**
 *
 * @param {*} req receive a req.id from authorization.
 * @param {*} res all orders by user
 * @param {*} next
 *
 */
exports.myOrder = async (req, res, next) => {};

/**
 *
 * @param {*} req receive an order id from admin, or sales rep
 * @param {*} res a single order
 * @param {*} next
 */
exports.queryOrderById = async (req, res, next) => {};

/**
 *
 * @param {*} req receive a user email or phone from admin, or sales rep
 * @param {*} res all orders by user
 * @param {*} next
 */
exports.queryOrderByUser = async (req, res, next) => {};
