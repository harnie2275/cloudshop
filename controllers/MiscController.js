const { StatusCodes } = require("http-status-codes");
const Message = require("../models/message");
const { respondWithError, respondWithSuccess } = require("../utils/response");

exports.contactUs = async (req, res, next) => {
  try {
    // todo: checkout for unread messages with length of 5 and suspend
    const message = await Message.create({ ...req.body });
    respondWithSuccess(res, message, "Message has been sent", StatusCodes.OK);
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};
