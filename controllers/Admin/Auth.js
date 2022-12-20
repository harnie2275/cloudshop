const { StatusCodes } = require("http-status-codes");
const User = require("../../models/User");
const {
  respondWithError,
  respondWithSuccess,
} = require("../../utils/response");

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email)
      return respondWithError(
        res,
        {},
        "Please provide an email address",
        StatusCodes.BAD_REQUEST
      );
    if (!password)
      return respondWithError(
        res,
        {},
        "Please provide a password",
        StatusCodes.BAD_REQUEST
      );
    const admin = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
    if (["user"].includes(admin.role))
      return respondWithError(
        res,
        {},
        "Not permitted to perform such task",
        StatusCodes.UNAUTHORIZED
      );

    if (!admin)
      return respondWithError(
        res,
        {},
        "No admin account with this email was found",
        StatusCodes.BAD_REQUEST
      );
    const correctPassword = await admin.comparePassword(password);

    if (!correctPassword)
      return respondWithError(
        res,
        {},
        "Incorrect password",
        StatusCodes.BAD_REQUEST
      );
    const token = await admin.generateToken();
    respondWithSuccess(res, { token }, "Login successful", StatusCodes.OK);
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};
