const { StatusCodes } = require("http-status-codes");
const Vendor = require("../../models/Vendor/Vendor");
const cloudinary = require("../../utils/image/upload");
const {
  respondWithError,
  respondWithSuccess,
} = require("../../utils/response");

exports.getAllVendorImages = async (req, res, next) => {
  const vendor = await Vendor.findById(req.vendor?._id);

  try {
    cloudinary.api.resources(
      {
        max_results: 500,
        prefix: `vendor/${vendor._id.toString()}`,
        type: "upload",
      },
      (error, result) => {
        if (error) {
          return respondWithError(
            res,
            {},
            error?.message,
            StatusCodes.BAD_REQUEST
          );
        }
        respondWithSuccess(
          res,
          result.resources,
          "image fetched successfully",
          StatusCodes.OK
        );
      }
    );
  } catch (error) {
    respondWithError(res, {}, error.error.message, StatusCodes.BAD_REQUEST);
  }
};

exports.addVendorImage = async (req, res, next) => {
  const vendor = await Vendor.findById(req.vendor?._id);

  try {
    if (!req.body.images)
      return respondWithError(res, {}, "add image", StatusCodes.BAD_REQUEST);
    let photos = [];
    req.body.images.map(async (image, i, array) => {
      const addImage = await cloudinary.uploader.upload(image, {
        folder: `vendor/${vendor?._id?.toString()}`,
      });

      photos.push(addImage);
      if (i === array.length - 1) {
        respondWithSuccess(
          res,
          photos,
          "image has been uploaded successfully",
          StatusCodes.OK
        );
      }
    });
  } catch (error) {
    console.log(error);
    respondWithError(res, {}, error?.error?.message, StatusCodes.BAD_REQUEST);
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    if (!req.body.images)
      return respondWithError(res, {}, "add image", StatusCodes.BAD_REQUEST);

    const addImage = await cloudinary.api.delete_resources(req.body.images);

    respondWithSuccess(
      res,
      addImage,
      "image has been deleted successfully",
      StatusCodes.OK
    );
  } catch (error) {
    console.log(error);
    respondWithError(res, {}, error?.error?.message, StatusCodes.BAD_REQUEST);
  }
};
