const asyncHandler = require("express-async-handler");
const Vendor = require("../../models/Vendor/Vendor");
const {
  respondWithError,
  respondWithSuccess,
} = require("../../utils/response");

exports.getAllVendors = asyncHandler(async (req, res) => {
  const vendors = await Vendor.find();

  if (!vendors)
    return respondWithError(res, [], "An error occured while fetching vendors");

  return respondWithSuccess(res, vendors);
});

exports.getOneVendor = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const vendor = await Vendor.findById(id);

  if (!vendor)
    return respondWithError(res, [], "An error occured while fetching vendor");

  return respondWithSuccess(res, vendor);
});

exports.suspendVendor = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const suspendVendor = await Vendor.findByIdAndUpdate(id, {
    disabled: true,
  });
  if (!suspendVendor)
    return respondWithError(res, [], "An error occured while disabling vendor");

  return respondWithSuccess(res, suspendVendor, "Successfully disabled");
});

exports.unsuspendVendor = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const unsuspendVendor = await Vendor.findByIdAndUpdate(id, {
    disabled: false,
  });
  if (!unsuspendVendor)
    return respondWithError(res, [], "An error occured while enabling vendor");

  return respondWithSuccess(res, unsuspendVendor, "Successfully enabled");
});
