const { StatusCodes } = require("http-status-codes");
const { WEB_APP_URL } = require("../config/env");
const Token = require("../models/Token");
const User = require("../models/User");
const { respondWithError, respondWithSuccess } = require("../utils/response");
const crypto = require("crypto");

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns user information if verified
 */
exports.profile = async (req, res, next) => {
  try {
    const user = await User.findById(req.id);
    if (!user)
      return respondWithError(
        res,
        {},
        "Could not find user",
        StatusCodes.BAD_REQUEST
      );

    const token = await user.generateToken();

    if (user.verified === undefined || user.verified === false) {
      await Token.findOneAndDelete({ userId: user._id });

      const randomToken = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();

      const link = `${WEB_APP_URL}/activate?token=${randomToken.token}`;
      return respondWithSuccess(
        res,
        { tempoLink: link, unverified: true },
        `Verify your email address, an email has been sent to ${user.email}`,
        StatusCodes.OK
      );
    }
    respondWithSuccess(res, { user }, "", StatusCodes.OK);
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};
