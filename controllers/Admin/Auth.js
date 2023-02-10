const { StatusCodes } = require("http-status-codes");
const User = require("../../models/User");
const {
  respondWithError,
  respondWithSuccess,
} = require("../../utils/response");
const { regAdminValidator } = require("../../utils/validator");
const randomize = require("randomatic");
const { ADMIN_APP_URL } = require("../../config/env");
const crypto = require("crypto");
const Token = require("../../models/Token");
const {
  activateAccount,
} = require("../../utils/helper/template/activateAccount");
const mailer = require("../../utils/mailer");

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(email)
    if (!email)
      return respondWithError(
        res,
        {},
        "Please provide an email address",
        StatusCodes.BAD_REQUEST
      );
    if (!password)
      return respondWithError(
        res,
        {},
        "Please provide a password",
        StatusCodes.BAD_REQUEST
      );


    const admin = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );



    if (!admin)
      return respondWithError(
        res,
        {},
        "No admin account with this email was found",
        StatusCodes.BAD_REQUEST
      );
    if (["user"].includes(admin.role))
      return respondWithError(
        res,
        {},
        "Not permitted to perform such task",
        StatusCodes.UNAUTHORIZED
      );

    const correctPassword = await admin.comparePassword(password);

    if (!correctPassword)
      return respondWithError(
        res,
        {},
        "Incorrect password",
        StatusCodes.BAD_REQUEST
      );
    const token = await admin.generateToken();
    respondWithSuccess(res, { token }, "Login successful", StatusCodes.OK);
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

exports.registerStaff = async (req, res, next) => {
  try {
    const { error } = regAdminValidator(req.body);
    if (error) {
      respondWithError(
        res,
        {},
        error.details?.[0].message,
        StatusCodes.BAD_REQUEST
      );
      return;
    }
    if (req.body.role === "user")
      return respondWithError(
        res,
        {},
        "This account cannot be created",
        StatusCodes.BAD_REQUEST
      );
    const finalObj = {
      ...req.body,
      password: randomize("0", 6),
      verified: true,
      // role: req.body.role ? req.body.role : "admin",
    };
    console.log(finalObj);
    const admin = await User.findOneOrCreate(
      { email: req.body?.email },
      { ...finalObj }
    );
    if (!admin)
      return respondWithError(
        res,
        {},
        "Something went wrong",
        StatusCodes.BAD_REQUEST
      );
    const randomToken = await new Token({
      userId: admin._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    // todo: send email

    const link = `${ADMIN_APP_URL}/setpassword?token=${randomToken.token}`;

    const MESSAGE = activateAccount(link, admin.email);
    /**
     * @return send link to user mail
     */
    mailer({
      message: MESSAGE,
      email: admin.email,
      subject: "ADMIN ACCOUNT COMPLETION",
    });

    respondWithSuccess(res, {}, "Account has been created", StatusCodes.OK);
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};
