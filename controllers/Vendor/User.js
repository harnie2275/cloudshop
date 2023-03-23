const asyncHandler = require("express-async-handler");
const Vendor = require("../../models/Vendor/Vendor");
const mailer = require("../../utils/mailer");
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

exports.updateVendor = asyncHandler(async (req, res) => {
  const vendor = req.vendor;
  const update = req.body;

  if (!update) return respondWithError(res, [], "Nothing to update", 400);

  const updatedVendor = await Vendor.findByIdAndUpdate(vendor._id, update);
  await updatedVendor.save();

  if (updatedVendor) {
    return respondWithSuccess(
      res,
      updatedVendor,
      "Your details have been updated successfully"
    );
  } else {
    return respondWithError(
      res,
      [],
      "An error occured while updating your account, please try again later"
    );
  }
});
