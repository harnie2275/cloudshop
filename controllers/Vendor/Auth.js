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
const randomize = require("randomatic");

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

exports.vendorLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  if (!email)
    return respondWithError(res, [], "Please provide an email address", 400);
  if (!password)
    return respondWithError(res, [], "Please provide a password", 400);

  const vendor = await Vendor.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );
  if (!vendor) return respondWithError(res, [], "This email is invalid");

  const correctPass = await vendor.comparePassword(password);

  if (!correctPass) return respondWithError(res, [], "Password incorrect", 400);
  console.log("Reached");
  const token = vendor.generateToken();
  if (!vendor.is_verified) {
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
      { token, email: vendor?.email, unverified: true },
      `A verification link has been sent to ${vendor.email}, please verify your account`,
      200
    );
  } else {
    return respondWithSuccess(res, { token }, "Authenticated", 200);
  }
});

exports.vendorResetPasswordLink = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email)
      return respondWithError(res, {}, "Email address is required", 400);
    const vendor = await Vendor.findOne({ email });
    if (!vendor)
      return respondWithError(
        res,
        {},
        "Vendor with this address doesn't exist ",
        400
      );

    //consideration: check for existing tokens and delete
    const OTP = randomize("0", 6);
    const randomToken = await Token.findOneOrCreate(
      { token: OTP },
      {
        userId: vendor._id,
        token: OTP,
      }
    );
    if (!randomToken)
      return respondWithError(res, {}, `something went wrong - TOKEN911`, 417);
    randomToken.save();

    /**
     * @param {*} sendMail send a mail to user.
     */
    mailer({
      email: vendor?.email,
      message: `Your verification token is ${randomToken.token}`,
      subject: "Reset Password OTP | Cloudshopa",
    });
    respondWithSuccess(
      res,
      {},
      `A One-Time Password has been sent to ${vendor.email}`,
      200
    );
  } catch (error) {
    respondWithError(res, {}, error.message, 400);
  }
};

exports.vendorResetPassword = async (req, res, next) => {
  try {
    const { otp, password } = req.body;
    if (!otp || !password) {
      if (!otp) return respondWithError(res, {}, "OTP is required", 400);
      if (!password)
        return respondWithError(res, {}, "Password is required", 400);
    }
    const correctToken = await Token.findOne({ token: otp });
    if (!correctToken)
      return respondWithError(
        res,
        { type: "invalid_otp" },
        "Invalid OTP, Please provide the right OTP",
        400
      );
    const vendor = await Vendor.findById(correctToken.userId).select(
      "+password"
    );
    if (!vendor)
      return respondWithError(
        res,
        { type: "invalid_otp" },
        "Invalid OTP, Please provide the right OTP",
        400
      );
    const salt = await bcrypt.genSalt(10);

    // Hash the password

    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newVendorInfo = await Vendor.findByIdAndUpdate(vendor._id, {
      password: hashedPassword,
    });
    newVendorInfo.save();
    correctToken.delete();
    const token = await vendor.generateToken();
    respondWithSuccess(
      res,
      { token },
      "Password has been reset successfully",
      200
    );
  } catch (error) {
    respondWithError(res, {}, error.message, 400);
  }
};
