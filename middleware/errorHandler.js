const { StatusCodes } = require("http-status-codes");
const { respondWithError } = require("../utils/response");
const errorHandlerMiddleware = (err, req, res, next) => {
  const error = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong try again later",
  };
  if (err.name === "ValidationError") {
    error.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
    error.statusCode = 400;
  }
  if (err.code && err.code === 11000) {
    error.msg = `duplicate value entered for ${Object.keys(
      err.keyValue
    )} field`;
    error.statusCode = 400;
  }
  if (err.name == "CastError") {
    error.msg = `No item found with ${err.value}`;
    error.statusCode = 404;
  }
  // console.log(err);
  return respondWithError(res, [], error.msg, error.statusCode);
  next();
};

module.exports = errorHandlerMiddleware;
