const asyncHandler = require("express-async-handler");

const bcrypt = require("bcryptjs");

const {
  respondWithError,
  respondWithSuccess,
} = require("../../utils/response");

const Vendor = require("../../models/Vendor/Vendor");

const Token = require("../../models/Token");

const crypto = require("crypto");

const vendor_url = require("../../utils/vendor_url");

const {
  activateAccount,
} = require("../../utils/helper/template/activateAccount");

const mailer = require("../../utils/mailer");

exports.createVendor = asyncHandler(async (req, res) => {
  console.log(req.body);
  if (!req.body.password) {
    return respondWithError(res, [], "Please provide a password", 400);
  }
  if (req.body.phone && req.body.phone.charAt(0) === "+") {
    return respondWithError(
      res,
      [],
      "Phone number should not start with a plus(+) sign"
    );
  }
  // Generate hashing salt

  const salt = await bcrypt.genSalt(10);

  // Hash the password

  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Transform the body password

  req.body.password = hashedPassword;

  const vendor = await (await Vendor.create(req.body)).save();
  if (vendor) {
    // Creates a verification token

    const randomToken = await new Token({
      userId: vendor._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    const verification_link = `${vendor_url}/activate?token=${randomToken.token}`;

    const MAIL_BODY = activateAccount(verification_link, vendor.email);

    mailer({
      email: vendor.email,
      subject: "Verify your email",
      message: MAIL_BODY,
    });

    //   Genetates a jwt token
    const token = vendor.generateToken();

    return respondWithSuccess(
      res,
      { token },
      `A verification link has been sent to ${vendor.email}, please follow the link to verify your email`
    );
  } else {
    return respondWithError(
      res,
      [],
      "An unknown error occured while signing you up, please try again later",
      500
    );
  }
});

exports.activateVendor = asyncHandler(async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return respondWithError(res, {}, "token is missing", 400);
    }
    const correctToken = await Token.findOne({ token });

    if (!correctToken) return respondWithError(res, {}, "Invalid token", 400);

    const fetchedVendor = await Vendor.findById(correctToken.userId);
    fetchedVendor.is_verified = true;
    fetchedVendor.save();
    correctToken.delete();

    /**
     * @description generate a fetch JWT with latest vendor info
     */
    const vendorJWT = await fetchedVendor.generateToken();
    respondWithSuccess(
      res,
      { vendorJWT },
      "Your account has been activated",
      200
    );
  } catch (error) {
    respondWithError(res, {}, error.message, 400);
  }
});

exports.resendVendorActivationLink = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.vendor?._id);
    if (!vendor) return respondWithError(res, {}, "vendor not found", 400);
    if (vendor.is_verified)
      return respondWithError(res, {}, "user has already been verified", 400);
    await Token.findOneAndDelete({ userId: vendor._id });

    const randomToken = await new Token({
      userId: vendor._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    const verification_link = `${vendor_url}/activate?token=${randomToken.token}`;

    const MAIL_BODY = activateAccount(verification_link, vendor.email);

    mailer({
      email: vendor.email,
      subject: "Verify your email",
      message: MAIL_BODY,
    });

    return respondWithSuccess(
      res,
      {},
      `Link has been send to your email address - ${vendor.email}`,
      200
    );
  } catch (error) {
    respondWithError(res, {}, error.message, 400);
  }
};
