const { StatusCodes } = require("http-status-codes");
const jsonwebtoken = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");
const Vendor = require("../models/Vendor/Vendor");
const { respondWithError } = require("../utils/response");

exports.vendorMiddleware = async (req, res, next) => {
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

    const verifyVendor = await Vendor.findById(decodedToken.userId);
    if (verifyVendor) {
      if (verifyVendor?.disabled)
        return respondWithError(
          res,
          [],
          "Your account has been disabled, please contact the administrator"
        );
      req.vendor = verifyVendor;
    } else {
      return respondWithError(res, [], "Not authorised", 401);
    }
    next();
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

exports.vendorIdentityMiddleware = async (req, res, next) => {
  if (!req.vendor?.identity_verified)
    return respondWithError(res, [], "You need to verify your identity");
  next();
};
