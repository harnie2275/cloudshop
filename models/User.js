const { model, Schema } = require("mongoose");
const bcrypt = require("bcryptjs");
const { JWT_SECRET, JWT_LIFETIME } = require("../config/env");
const jwt = require("jsonwebtoken");

const UserSchema = new Schema(
  {
    firstname: {
      type: String,
      trim: true,
      min: 3,
    },
    lastname: {
      type: String,
      trim: true,
      min: 3,
    },
    phone: {
      type: String,
      required: [true, "phone is required"],
      unique: true,
      min: 11,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: [true, "This email has been registered already"],
    },
    company: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    password: {
      type: String,
      min: 8,
      required: [true, "password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "user", "editor", "sale rep", "marketing"],
      default: "user",
    },
    dp: {
      type: String,
    },
    verified: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.statics.findOneOrCreate = function findOneOrCreate(condition, doc) {
  const self = this;
  const newDocument = doc;
  return new Promise((resolve, reject) => {
    return self
      .findOne(condition)
      .then((result) => {
        if (result) {
          return reject({
            message: "user with this address already exists",
            statusCode: 400,
          });
        }
        return self
          .create(newDocument)
          .then((result) => {
            return resolve(result);
          })
          .catch((error) => {
            return reject(error);
          });
      })
      .catch((error) => {
        return reject(error);
      });
  });
};

UserSchema.post("save", function (error, doc, next) {
  // if (error.name === "MongoServerError" && error.code === 11000) {
  if (error.code === 11000) {
    if (Object.keys(error.keyValue).includes("phone")) {
      next(new Error(`${error.keyValue.phone} has already been registered`));
    }
    if (Object.keys(error.keyValue).includes("email")) {
      next(new Error(`${error.keyValue.email} has already been registered`));
    }
  } else {
    next(error);
  }
});

/**
 * @return encrypted password
 */
UserSchema.pre("save", async function (next) {
  //Only run this function if password was moddified
  const salt = await bcrypt.genSalt(10);
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * @param {{
 * generateToken: any;
 * }} methods
 * @returns generated One-Time Token/Password
 */
UserSchema.methods.generateToken = function () {
  const token = jwt.sign({ userId: this._id, email: this.email }, JWT_SECRET, {
    expiresIn: JWT_LIFETIME,
  });
  return token;
};

/**
 *
 * @param {{
 * password: string
 * }} password
 * @returns true/false if password comparison check
 */
UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = model("User", UserSchema);

module.exports = User;
