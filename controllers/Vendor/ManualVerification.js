const asyncHandler = require("express-async-handler");
const {
  respondWithError,
  respondWithSuccess,
} = require("../../utils/response");
const Verification = require("../../models/Vendor/Verification");
const Vendor = require("../../models/Vendor/Vendor");

exports.uploadManualVerificationData = asyncHandler(async (req, res) => {
  const vendor = req.vendor;
  const body = req.convertedBody;
  try {
    const verification = await Verification.create({
      vendor_id: vendor?._id,
      ...body,
      status: "processing",
    });

    if (!verification)
      return respondWithError(
        res,
        [],
        "Unable to start verification process at the moment please try again later",
        503
      );

    const updateVendor = await Vendor.findByIdAndUpdate(vendor?._id, {
      verification_status: "processing",
    });

    if (!updateVendor)
      return respondWithError(
        res,
        [],
        "Could not start verification process, please try again after some minutes"
      );

    return respondWithSuccess(res, updateVendor, "Verification started");
  } catch (err) {
    console.log(err);
    respondWithError(res, [], "Error error error", 500);
  }
});
