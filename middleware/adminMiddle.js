const { StatusCodes } = require("http-status-codes");
const jsonwebtoken = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");
const User = require("../models/User");
const { respondWithError } = require("../utils/response");

exports.adminMiddle = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization)
      return respondWithError(
        res,
        {},
        "No Bearer token found",
        StatusCodes.UNAUTHORIZED
      );
    const token = authorization.split(" ")[1];
    if (!token)
      return respondWithError(
        res,
        {},
        "Invalid token",
        StatusCodes.UNAUTHORIZED
      );
    const decodedToken = jsonwebtoken.verify(token, JWT_SECRET);
    if (!decodedToken)
      return respondWithError(res, {}, "invalid authentication token");
    req.id = decodedToken.userId;
    const verifyAdmin = await User.findById(decodedToken.userId);
    if (["user"].includes(verifyAdmin.role))
      return respondWithError(
        res,
        {},
        "Not authorized",
        StatusCodes.UNAUTHORIZED
      );
    next();
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};
