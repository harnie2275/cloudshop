const { StatusCodes } = require("http-status-codes");
const cloudinary = require("../utils/image/upload");
const { respondWithError } = require("../utils/response");

exports.MultiPhotoConverter = async (req, res, next) => {
  try {
    const { photoGallery } = req.body;
    if (!photoGallery) {
      req.convertedBody = req.body;
      next();
      return;
    }
    let newPhotoGallery = [];
    photoGallery?.map(async (aPhoto, i) => {
      const productImageURL =
        aPhoto.substring(0, 4) !== "http" &&
        (await cloudinary.uploader.upload(aPhoto, {
          folder: "products",
        }));
      newPhotoGallery.push(
        aPhoto.substring(0, 4) !== "http" ? productImageURL?.secure_url : aPhoto
      );
      if (i === photoGallery.length - 1) {
        req.convertedBody = { ...req.body, photoGallery: newPhotoGallery };
        next();
      }
    });
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};
