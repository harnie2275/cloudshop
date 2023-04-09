const asyncHandler = require("express-async-handler");
const Verification = require("../../models/Vendor/Verification");
const {
  respondWithSuccess,
  respondWithError,
} = require("../../utils/response");
const Vendor = require("../../models/Vendor/Vendor");

exports.getAllVerifications = asyncHandler(async (req, res) => {
  const status = req.query?.status;

  const verifications = await Verification.find();
  if (verifications) {
    return respondWithSuccess(res, verifications);
  } else {
    return respondWithError(res, [], "An error occured while fetching docs");
  }
});

exports.getOneVerification = asyncHandler(async (req, res) => {
  const verification = await Verification.findById(req.params.id);
  if (verification) {
    return respondWithSuccess(res, verification);
  } else {
    return respondWithError(res, [], "An error occured while fetching doc");
  }
});

exports.getUnseenVerifications = asyncHandler(async (req, res) => {
  const unseenVerifications = await Verification.find({ admin_seen: false });
  if (unseenVerifications) {
    return respondWithSuccess(res, unseenVerifications.length);
  } else {
    return respondWithError(res, [], "An error occured while fetching docs");
  }
});

exports.updateSeenStatus = asyncHandler(async (req, res) => {
  const vids = req.body;
  const updated_verifications = await Verification.updateMany(
    { _id: { $in: vids } },
    { $set: { admin_seen: true } },
    { multi: true, upsert: true }
  );
  if (updated_verifications) {
    return respondWithSuccess(res, updated_verifications.length);
  } else {
    return respondWithError(res, [], "An error occured while updating docs");
  }
});

exports.updateVerificationStatus = asyncHandler(async (req, res) => {
  const vendor_id = req.body.vendor_id;

  const status = req.body?.status;

  if (!["verified", "failed"].includes(status))
    return respondWithError(res, [], "Status invalid", 400);

  const updatedVendor = await Vendor.findByIdAndUpdate(vendor_id, {
    verification_status: status,
    identity_verified: status === "verified",
  });

  const updatedVerification = await Verification.findByIdAndUpdate(
    req.params.id,
    {
      status: status,
    }
  );
  if (updatedVendor && updatedVerification) {
    return respondWithSuccess(
      res,
      [],
      status === "verified"
        ? "Successfully verified"
        : "Successfully disapproved"
    );
  } else {
    return respondWithError(res, [], "An error occured while updating docs");
  }
});
