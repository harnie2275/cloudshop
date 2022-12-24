const { StatusCodes } = require("http-status-codes");
const Message = require("../models/message");
const NewsLetter = require("../models/NewsLetter");
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

exports.JoinNewsLetter = async (req, res, next) => {
  try {
    // todo: checkout for unread messages with length of 5 and suspend

    const hasDuplicate = await NewsLetter.findOne({ email: req.body.email });

    if (hasDuplicate)
      return respondWithError(
        res,
        {},
        "Your email already exist in our newsletter",
        StatusCodes.BAD_REQUEST
      );

    const newsLetterJoinee = await NewsLetter.create({ ...req.body });
    respondWithSuccess(
      res,
      newsLetterJoinee,
      "You have been added to the newsletter daily/weekly mail",
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};
