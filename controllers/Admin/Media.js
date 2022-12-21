const { StatusCodes } = require("http-status-codes");
const cloudinary = require("../../utils/image/upload");
const {
  respondWithError,
  respondWithSuccess,
} = require("../../utils/response");

exports.getAllImage = async (req, res, next) => {
  try {
    const allCloudImage = await cloudinary.api.resources();
    if (allCloudImage.error)
      respondWithError(
        res,
        {},
        allCloudImage.error.message,
        StatusCodes.BAD_REQUEST
      );
    respondWithSuccess(
      res,
      allCloudImage.resources,
      "image fetched successfully",
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.error.message, StatusCodes.BAD_REQUEST);
  }
};

exports.addImage = async (req, res, next) => {
  try {
    if (!req.body.images)
      return respondWithError(res, {}, "add image", StatusCodes.BAD_REQUEST);
    let photos = [];
    req.body.images.map(async (image, i, array) => {
      const addImage = await cloudinary.uploader.upload(image, {
        folder: "products",
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
