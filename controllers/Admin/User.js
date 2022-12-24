const { StatusCodes } = require("http-status-codes");
const User = require("../../models/User");
const {
  respondWithError,
  respondWithSuccess,
} = require("../../utils/response");

exports.adminQueryUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return respondWithError(
        res,
        {},
        "no user was found",
        StatusCodes.BAD_REQUEST
      );
    respondWithSuccess(res, user, "user has been fetched", StatusCodes.OK);
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

exports.adminGetUsers = async (req, res, next) => {
  try {
    const { perPage, page } = req.query;
    const limit = perPage ? perPage : 20;
    const skip = page ? page - 1 : 0;
    const totalDoc = await (await User.find()).length;
    const user = await User.find()
      .limit(limit)
      .skip(skip * limit);
    respondWithSuccess(
      res,
      { user, totalDoc },
      "user has been fetched",
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

exports.adminGetStaff = async (req, res, next) => {
  try {
    const { perPage, page } = req.query;
    const limit = perPage ? perPage : 20;
    const skip = page ? page - 1 : 0;
    const totalDoc = await (await User.find()).length;
    const user = await User.find({
      role: "admin" || "sale rep" || "editor" || "marketing",
    });

    respondWithSuccess(
      res,
      { user, totalDoc },
      "user has been fetched",
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};
