const {
  CLOUD_NAME,
  CLOUD_API_KEY,
  CLOUD_API_SECRET,
} = require("../../config/env");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_API_SECRET,
});

module.exports = cloudinary;
