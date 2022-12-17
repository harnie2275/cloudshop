const { StatusCodes } = require("http-status-codes");
const { WEB_APP_URL } = require("../config/env");
const Token = require("../models/Token");
const User = require("../models/User");
const { respondWithError, respondWithSuccess } = require("../utils/response");
const crypto = require("crypto");
const { regValidator, loginValidator } = require("../utils/validator");
const randomize = require("randomatic");
const { use } = require("passport");

/**
 *
 * @param {*} req request made to this endpoint
 * @param {*} res response given by the endpoint
 * @param {*} next handler for further response function
 * @param {{
 * email: string;
 * password: string;
 * firstname: string;
 * lastname: string;
 * phone: number;
 * address: string;
 * city: string;
 * country: string;
 * state: string
 * }} register
 * @returns a JWT token of the user, and an activation link to verify email.
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, phone } = req.body;
    // if (!email || !password || !phone) {
    //   if (!email)
    //     return respondWithError(
    //       res,
    //       {},
    //       "Email address is required",
    //       StatusCodes.BAD_REQUEST
    //     );
    //   if (!phone)
    //     return respondWithError(
    //       res,
    //       {},
    //       "Phone number is required",
    //       StatusCodes.BAD_REQUEST
    //     );
    //   if (!password)
    //     return respondWithError(
    //       res,
    //       {},
    //       "Password is required",
    //       StatusCodes.BAD_REQUEST
    //     );
    // }
    const { error } = regValidator({
      email: email,
      password: password,
      phone: phone,
    });
    if (error) {
      return respondWithError(
        res,
        {},
        error.details?.[0].message,
        StatusCodes.BAD_REQUEST
      );
    }
    const createdUser = await User.findOneOrCreate({ email }, { ...req.body });
    if (!createdUser)
      return respondWithError(
        res,
        {},
        "User already exist",
        StatusCodes.BAD_REQUEST
      );
    createdUser.save();
    /**
     * @return generate OTP to verify email address
     */
    const randomToken = await new Token({
      userId: createdUser._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    const link = `${WEB_APP_URL}/activate?token=${randomToken.token}`;
    /**
     * @return send link to user mail
     */

    /**
     * @return generate token and endpoint response
     */
    const token = await createdUser.generateToken();
    if (
      req.query?.fromCheckout !== undefined &&
      req.query.fromCheckout === true
    ) {
      return respondWithSuccess(
        res,
        { token, tempoLink: link, userId: createdUser._id },
        `A mail has been sent to ${createdUser.email}, kindly verify your account`,
        StatusCodes.OK
      );
    }

    return respondWithSuccess(
      res,
      { token, tempoLink: link },
      `A mail has been sent to ${createdUser.email}, kindly verify your account`,
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

/**
 * @param {*} req email and password is required to login returning users.
 * @param {{
 * email: string;
 * password: string;
 * }} login
 * @returns a JWT token of the user
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { error } = loginValidator({ email: email, password: password });
    if (error !== false) {
      return respondWithError(res, {}, error?.message, StatusCodes.BAD_REQUEST);
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return respondWithError(
        res,
        {},
        "email address has not been register",
        StatusCodes.NOT_ACCEPTABLE
      );

    /**
     * @param {*} comparePassword validate password against database
     */
    const correctPass = await user.comparePassword(password);
    if (!correctPass)
      return respondWithError(
        res,
        {},
        "password is incorrect",
        StatusCodes.NOT_ACCEPTABLE
      );
    /**
     * @param {*} generateToken
     *  @param {*}
     * @return generate token and endpoint response
     */

    const token = await user.generateToken();

    if (user.verified === undefined || user.verified === false) {
      await Token.findOneAndDelete({ userId: user._id });

      const randomToken = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();

      const link = `${WEB_APP_URL}/activate?token=${randomToken.token}`;
      return respondWithSuccess(
        res,
        { token, tempoLink: link, unverified: true },
        `Verify your email address, an email has been sent to ${user.email}`,
        StatusCodes.OK
      );
    }

    return respondWithSuccess(
      res,
      { token },
      "Login successfully",
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

/**
 *
 * @param {*} req receive a token in the query
 * @param {*} res activate or reject based on correctness of OTP or expiration period
 * @param {*} next maunal handler for further function after res
 */
exports.activateAccount = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return respondWithError(
        res,
        {},
        "token is missing",
        StatusCodes.BAD_REQUEST
      );
    }
    const correctToken = await Token.findOne({ token });
    if (!correctToken)
      return respondWithError(
        res,
        {},
        "Invalid token",
        StatusCodes.BAD_REQUEST
      );
    const fetchedUser = await User.findById(correctToken.userId);
    fetchedUser.verified = true;
    fetchedUser.save();
    correctToken.delete();

    /**
     * @description generate a fetch JWT with latest user info
     */
    const userJWT = await fetchedUser.generateToken();
    respondWithSuccess(
      res,
      { userJWT },
      "Account has been activated",
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns sends new activation link to unverified account and deleting previous one
 */
exports.resendActivateLink = async (req, res, next) => {
  try {
    const user = await User.findById(req.id);
    if (!user)
      return respondWithError(
        res,
        {},
        "user not found",
        StatusCodes.BAD_REQUEST
      );
    if (user.verified === true)
      return respondWithError(
        res,
        {},
        "user has already been verified",
        StatusCodes.BAD_REQUEST
      );
    await Token.findOneAndDelete({ userId: user._id });

    const randomToken = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    const link = `${WEB_APP_URL}/activate?token=${randomToken.token}`;
    return respondWithSuccess(
      res,
      { tempoLink: link },
      `Link has been send to your email address - ${user.email}`,
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns send 6 digits One-Time Password to verify ownership before resetting password
 */
exports.resetPasswordLink = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email)
      return respondWithError(
        res,
        {},
        "Email address is required",
        StatusCodes.BAD_REQUEST
      );
    const user = await User.findOne({ email });
    if (!user)
      return respondWithError(
        res,
        {},
        "User with this address doesn't exist ",
        StatusCodes.BAD_REQUEST
      );

    //consideration: check for existing tokens and delete
    const OTP = randomize("0", 6);
    const randomToken = await Token.findOneOrCreate(
      { token: OTP },
      {
        userId: user._id,
        token: OTP,
      }
    );
    if (!randomToken)
      return respondWithError(
        res,
        {},
        `something went wrong - TOKEN911`,
        StatusCodes.EXPECTATION_FAILED
      );
    randomToken.save();

    /**
     * @param {*} sendMail send a mail to user.
     */
    respondWithSuccess(
      res,
      { tempoOTP: randomToken.token },
      `A One-Time Password has been sent to ${user.email}`,
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { otp, password } = req.body;
    if (!otp || !password) {
      if (!otp)
        return respondWithError(
          res,
          {},
          "OTP is required",
          StatusCodes.BAD_REQUEST
        );
      if (!password)
        return respondWithError(
          res,
          {},
          "Password is required",
          StatusCodes.BAD_REQUEST
        );
    }
    const correctToken = await Token.findOne({ token: otp });
    if (!correctToken)
      return respondWithError(
        res,
        {},
        "Invalid OTP, Please provide the right OTP",
        StatusCodes.BAD_REQUEST
      );
    const user = await User.findById(correctToken.userId).select("+password");
    if (!user)
      return respondWithError(
        res,
        {},
        "Invalid OTP, Please provide the right OTP",
        StatusCodes.BAD_REQUEST
      );
    user.password = password;
    user.save();
    correctToken.delete();
    const token = await user.generateToken();
    respondWithSuccess(
      res,
      { token },
      "Password has been reset successfully",
      StatusCodes.OK
    );
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};

exports.updateAccount = async (req, res, next) => {
  try {
    if (Object.entries(req.body).length < 1) {
      respondWithError(
        res,
        {},
        "Please provide an information to be update",
        StatusCodes.BAD_REQUEST
      );
      return;
    }
    if (Object.keys(req.body).includes("email")) {
      respondWithError(
        res,
        {},
        "email address can't be updated",
        StatusCodes.BAD_REQUEST
      );
      return;
    }
    await User.findByIdAndUpdate(
      req.id,
      { ...req.body },
      { new: true },
      function (err, model) {
        if (err) {
          respondWithError(res, {}, err.message, StatusCodes.BAD_REQUEST);
          return;
        }
        respondWithSuccess(
          res,
          model,
          "User Information has been updated",
          StatusCodes.OK
        );
      }
    ).clone();
  } catch (error) {
    respondWithError(res, {}, error.message, StatusCodes.BAD_REQUEST);
  }
};
