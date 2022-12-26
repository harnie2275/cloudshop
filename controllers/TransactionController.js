const { StatusCodes } = require("http-status-codes");
const Ledger = require("../models/Ledger");
const Transaction = require("../models/Transaction");
const { convertToCLDX } = require("../utils/convertToCLDX");
const { verifyPayment } = require("../utils/helper/paystack/verifyPayment");
const { respondWithError, respondWithSuccess } = require("../utils/response");

exports.fundWallet = async (req, res, next) => {
  try {
    const { paymentRef } = req.body;
    if (!paymentRef)
      return respondWithError(
        res,
        {},
        "payment reference is required",
        StatusCodes.BAD_REQUEST
      );
    // todo: verify paymentRef

    const doudbleRef = await Transaction.findOne({ trnxRef: paymentRef });
    if (doudbleRef)
      return respondWithError(
        res,
        {},
        "A transaction already exist with this payment reference",
        StatusCodes.BAD_REQUEST
      );

    const verifyPaymentRef = await verifyPayment(paymentRef);
    if (!verifyPaymentRef.status)
      return respondWithError(
        res,
        {},
        verifyPaymentRef.message,
        StatusCodes.BAD_REQUEST
      );
    const userLedger = await Ledger.findOne({ user: req.id });

    if (!userLedger)
      return respondWithError(
        res,
        {},
        "could not found user wallet",
        StatusCodes.BAD_REQUEST
      );

    const CLDX_Equivalent = await convertToCLDX(
      verifyPaymentRef.payment.amount
    );

    userLedger.CLDX += parseFloat(CLDX_Equivalent);

    await userLedger.save();

    await Transaction.create({
      user: req.id,
      activity: "fund account",
      trnxRef: paymentRef,
    });

    respondWithSuccess(res, userLedger, "Wallet funded", StatusCodes.OK);
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

exports.accountBalance = async (req, res, next) => {
  try {
    const balance = await Ledger.findOne({ user: req.id });
    if (!balance) {
      return respondWithError(
        res,
        {},
        "Couldn't get access to user balance",
        StatusCodes.BAD_REQUEST
      );
    }
    respondWithSuccess(
      res,
      balance.CLDX,
      "User balance fetched successfully",
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error, StatusCodes.BAD_REQUEST);
  }
};
