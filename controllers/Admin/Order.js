const { StatusCodes } = require("http-status-codes");
const randomize = require("randomatic");
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const User = require("../../models/User");
const {
  respondWithError,
  respondWithSuccess,
} = require("../../utils/response");

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.adminGetOrder = async (req, res, next) => {
  try {
    const order = await Order.find();
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
      "Orders was fetched successfully",
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

exports.adminQueryOrder = async (req, res, next) => {
  try {
    if (!req.query.id)
      return respondWithError(
        res,
        {},
        "no id was found",
        StatusCodes.BAD_REQUEST
      );
    const order = await Order.findOne({ orderId: req.query.id });
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
      "Orders was fetched successfully",
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

/**
 *
 * @param {*} req.body receive an order id whose order status is not delivered from an admin or sales rep
 * @param {*} res deny user, editor and markerter right.
 * @param {*} next
 * @returns updateInventory
 */
exports.adminCancelOrder = async (req, res, next) => {
  try {
    const admin = await User.findById(req.id);
    if (admin.role !== "admin" && admin.role !== "sale rep")
      return respondWithError(
        res,
        {},
        "Your are not authorized to perform such task",
        StatusCodes.UNAUTHORIZED
      );
    const { userId, orderId } = req.body;
    if (!userId || !orderId)
      return respondWithError(
        res,
        {},
        "Select a user and order",
        StatusCodes.BAD_REQUEST
      );
    const order = await Order.findOne({ orderId, user: userId });
    if (!order)
      return respondWithError(
        res,
        {},
        "no order was found",
        StatusCodes.BAD_REQUEST
      );
    if (order.status === "cancel")
      return respondWithError(
        res,
        {},
        "Order was already cancelled",
        StatusCodes.BAD_REQUEST
      );
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
 * @param {*} req.body receive an order id whose order status is not canceled
 * @param {*} res deny user, editor and markerter right.
 * @param {*} next
 * @returns update field or paymentRef for cash on delivery and status
 */
exports.adminUpdateOrder = async (req, res, next) => {
  try {
    const admin = await User.findById(req.id);
    if (admin.role !== "admin" && admin.role !== "sale rep")
      return respondWithError(
        res,
        {},
        "Your are not authorized to perform such task",
        StatusCodes.UNAUTHORIZED
      );

    if (Object.entries(req.body).length < 1)
      return respondWithError(
        res,
        {},
        "request must receive both an order id and an action",
        StatusCodes.BAD_REQUEST
      );
    const action = [
      "orderId",
      "items",
      "paymentMethod",
      "user",
      "totalAmount",
      "totalShippingFee",
    ];
    if (action.includes(Object.keys(req.body).join())) {
      return respondWithError(
        res,
        {},
        "invalid action",
        StatusCodes.BAD_REQUEST
      );
    }

    const updatedOrder = await Order.findOne({ orderId: req.params.id });
    if (!updatedOrder)
      return respondWithError(
        res,
        {},
        "no order was found",
        StatusCodes.BAD_REQUEST
      );
    if (updatedOrder.status === "cancel")
      return respondWithError(
        res,
        {},
        "Order has already been cancelled",
        StatusCodes.BAD_REQUEST
      );
    if (
      updatedOrder.status === "delivered" &&
      Object.keys(req.body).includes("status")
    )
      return respondWithError(
        res,
        {},
        "Order has already been delivered",
        StatusCodes.BAD_REQUEST
      );
    if (
      updatedOrder.status === "delivered" &&
      updatedOrder.paymentRef !== undefined &&
      Object.keys(req.body).includes("paymentRef")
    )
      return respondWithError(
        res,
        {},
        "Order has already been delivered with a payment ref added",
        StatusCodes.BAD_REQUEST
      );
    Object.entries(req.body).forEach((anAction, item) => {
      updatedOrder[anAction[0]] = anAction[1];
      if (item === Object.entries(req.body).length - 1) {
        updatedOrder.save();
        respondWithSuccess(
          res,
          updatedOrder,
          "order has been updated",
          StatusCodes.BAD_REQUEST
        );
      }
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
