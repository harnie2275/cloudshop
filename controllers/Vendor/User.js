const asyncHandler = require("express-async-handler");
const {
  respondWithSuccess,
  respondWithError,
} = require("../../utils/response");

exports.getVendor = asyncHandler(async (req, res) => {
  const vendor = req.vendor;
  if (vendor) {
    return respondWithSuccess(res, vendor, "Success", 200);
  } else {
    respondWithError(res, [], "You are not authorised", 401);
  }
});
