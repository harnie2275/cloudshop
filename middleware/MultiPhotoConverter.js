const { StatusCodes } = require("http-status-codes");
const cloudinary = require("../utils/image/upload");
const { respondWithError } = require("../utils/response");
const asyncHandler = require("express-async-handler");

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

exports.VerificationDocumentConverter = asyncHandler(async (req, res, next) => {
  const vendor = req.vendor;
  if (vendor?.identity_verified)
    return respondWithError(res, [], "Your identity is already verified");
  if (vendor?.verification_status === "processing")
    return respondWithError(res, [], "Verification process in progress");
  const { document_images, selfie_image } = req.body;

  if (!document_images) {
    return respondWithError(
      res,
      [],
      "Please provide your document images",
      400
    );
  }
  if (!selfie_image) {
    return respondWithError(res, [], "Please provide a selfie image", 400);
  }
  if (document_images?.length < 2) {
    return respondWithError(
      res,
      [],
      "Your document images should be a minimum and maximum of two images",
      400
    );
  }

  //  Upload images

  try {
    let documents = [];
    let selfie = "";
    const selfie_upload = await cloudinary.uploader.upload(selfie_image, {
      folder: `verification/${vendor?._id?.toString()}`,
    });

    if (!selfie_upload.secure_url)
      return respondWithError(
        res,
        "An error occured while uploading your selfie image, please try again"
      );
    selfie = selfie_upload.secure_url;

    document_images.map(async (image, i, array) => {
      const addImage = await cloudinary.uploader.upload(image, {
        folder: `verification/${vendor?._id?.toString()}`,
      });

      documents.push(addImage.secure_url);
      if (i === array.length - 1) {
        req.convertedBody = {
          ...req.body,
          selfie_image: selfie,
          document_images: documents,
        };
        next();
      }
    });
  } catch (err) {
    console.log(err);
    return respondWithError(res, "An error occured while uploading documents");
  }
});
