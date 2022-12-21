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
