const { StatusCodes } = require("http-status-codes");
const randomize = require("randomatic");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
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
  const { error } = orderValidator(req.body);
  if (error)
    return respondWithError(
      res,
      {},
      error.details?.[0].message,
      StatusCodes.BAD_REQUEST
    );
  try {
    const newBody = req.newBody !== undefined ? req.newBody : req.body;
    const restructedObj = { orderId: randomize("0", 8), ...newBody };
    const newOrder = await Order.create({ ...restructedObj });

    if (!newOrder)
      return respondWithError(
        res,
        {},
        "Something went wrong while create the order",
        StatusCodes.BAD_REQUEST
      );
    /**
     * @param {*} updateInventory
     */
    newOrder.items.map(async (anItem, i) => {
      await updateInventory(anItem, "reduce")
        .then(() => {})
        .catch((error) => {
          respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
        });
      if (i === newOrder.items.length - 1) {
        /**
         * @returns send order mail for placement of order and all necessary details
         */
        respondWithSuccess(
          res,
          newOrder,
          "Your order has been placed",
          StatusCodes.OK
        );
      }
    });
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

/**
 *
 * @param {object} item
 * @param {string} action
 * @returns
 */
const updateInventory = async (item, action) => {
  try {
    const product = await Product.findById(item?.id);
    if (product.productType === "digital") {
      return;
    }
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
exports.userCancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || id === ":id")
      return respondWithError(res, {}, "order id is required");
    const order = await Order.findOne({ orderId: id, user: req.id });
    if (!order)
      return respondWithError(
        res,
        {},
        "no order was found",
        StatusCodes.BAD_REQUEST
      );
    if (order.status === "cancel") {
      respondWithError(
        res,
        {},
        "Order was already cancelled",
        StatusCodes.BAD_REQUEST
      );
      return;
    }
    order.status = "cancel";
    await order.save();
    /**
     * @description updateInventory  add back the units to the inventory
     */
    order.items.map(async (anItem, i) => {
      await updateInventory(anItem, "add")
        .then(() => {})
        .catch((error) => {
          respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
        });
      if (i === order.items.length - 1) {
        /**
         * @returns send order mail for placement of order and all necessary details
         */
        respondWithSuccess(
          res,
          order,
          `Order ${order.orderId} has been cancelled`,
          StatusCodes.OK
        );
      }
    });
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

/**
 *
 * @param {*} req receive a req.id from authorization.
 * @param {*} res all orders by user
 * @param {*} next
 *
 */
exports.myOrder = async (req, res, next) => {
  try {
    const order = await Order.find({ user: req.id });
    if (!order)
      return respondWithError(
        res,
        {},
        "no orders were found",
        StatusCodes.BAD_REQUEST
      );
    respondWithSuccess(
      res,
      order,
      "Your orders was fetched successfully",
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

/**
 *
 * @param {*} req receive an order id from admin, or sales rep
 * @param {*} res a single order
 * @param {*} next
 */
exports.queryOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return respondWithError(
        res,
        {},
        "no order id was found",
        StatusCodes.BAD_REQUEST
      );
    }
    const order = await Order.findOne({ orderId: id });
    if (!order) {
      respondWithError(res, {}, "no order was found", StatusCodes.BAD_REQUEST);
      return;
    }
    respondWithSuccess(
      res,
      order,
      `order with id ${order.orderId}`,
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

/**
 *
 * @param {*} req receive a user email or phone from admin, or sales rep
 * @param {*} res all orders by user
 * @param {*} next
 */
exports.queryOrderByUser = async (req, res, next) => {};
