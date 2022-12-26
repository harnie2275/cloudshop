const { StatusCodes } = require("http-status-codes");
const Ledger = require("../models/Ledger");
const { convertToCLDX } = require("../utils/convertToCLDX");
const { respondWithError } = require("../utils/response");
const { orderValidator } = require("../utils/validator");
const crypto = require("crypto");
const Transaction = require("../models/Transaction");
const { verifyPayment } = require("../utils/helper/paystack/verifyPayment");

exports.cloudaxPay = async (req, res, next) => {
  try {
    const { error } = orderValidator(req.body);
    if (error)
      return respondWithError(
        res,
        {},
        error.details?.[0].message,
        StatusCodes.BAD_REQUEST
      );
    const { paymentMethod, totalAmount } = req.body;
    if (paymentMethod === "CLDX") {
      // todo: make withdrawal from user ledger and create a reference and transaction
      const userLedger = await Ledger.findOne({ user: req.id });
      if (!userLedger)
        return respondWithError(
          res,
          {},
          "could not find a CLDX wallet in user account",
          StatusCodes.BAD_REQUEST
        );
      const CLDX_Equivalent = await convertToCLDX(totalAmount);

      if (userLedger.CLDX < CLDX_Equivalent)
        return respondWithError(
          res,
          {},
          "Insufficient CLDX token",
          StatusCodes.BAD_REQUEST
        );

      userLedger.CLDX -= CLDX_Equivalent;

      userLedger.save();

      const paymentRef = crypto.randomBytes(32).toString("hex");

      await Transaction.create({
        user: req.id,
        activity: "product order",
        trnxRef: paymentRef,
      });

      req.newBody = { ...req.body, paymentRef, status: "confirmed" };
      next();
      return;
    }
    if (paymentMethod === "card") {
      // TODO: verify payment and update status
      const doudbleRef = await Transaction.findOne({
        trnxRef: req.body.paymentRef,
      });
      if (doudbleRef)
        return respondWithError(
          res,
          {},
          "A transaction already exist with this payment reference",
          StatusCodes.BAD_REQUEST
        );
      const verifyPaymentRef = await verifyPayment(req.body.paymentRef);
      if (!verifyPaymentRef.status)
        return respondWithError(
          res,
          {},
          verifyPaymentRef.message,
          StatusCodes.BAD_REQUEST
        );
      await Transaction.create({
        user: req.id,
        activity: "product order",
        trnxRef: req.body.paymentRef,
      });

      req.newBody = { ...req.body, status: "confirmed" };
      next();
      return;
    }
    next();
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};
