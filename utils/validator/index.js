const JOI = require("joi");
/**
 * @param {{
 *  email,
 * password,
 * phone,
 * }} data
 * @returns
 */
const regValidator = (data) => {
  const schema = JOI.object({
    email: JOI.string().required().email(),
    role: JOI.string(),
    firstname: JOI.string(),
    lastname: JOI.string(),
    password: JOI.string().required().min(8).max(255),
    phone: JOI.string().required().min(11).max(20),
  });

  return schema.validate(data);
};

const regAdminValidator = (data) => {
  const schema = JOI.object({
    email: JOI.string().required().email(),
    role: JOI.string().required(),
    phone: JOI.string().required().min(11).max(20),
    firstname: JOI.string(),
    lastname: JOI.string(),
  });

  return schema.validate(data);
};

/**
 * @param {{
 *  email,
 * password,
 * }}
 * @returns
 */
const loginValidator = ({ email, password }) => {
  let error;
  if (email === undefined) {
    error = { field: "email", message: "email is required" };
    return { error };
  }

  if (password === undefined) {
    error = { field: "password", message: "password is required" };
    return { error };
  }
  return { error: false };
};

const productValidator = (data) => {
  const schema = JOI.object({
    displayName: JOI.string().required(),
    amount: JOI.number().required(),
    productCategory: JOI.object().required(),
    productImage: JOI.string().required(),
    catchPhrase: JOI.string().required(),
    productType: JOI.string().required(),
    SKU: JOI.string().required(),
    inventory: JOI.object(),
    shippingFee: JOI.number(),
    photoGallery: JOI.array(),
    variation: JOI.object(),
    productTag: JOI.array(),
    detailedDescription: JOI.string(),
    regularPrice: JOI.string(),
    file: JOI.string(),
    addedBy: JOI.string().required(),
  });

  return schema.validate(data);
};

const orderValidator = (data) => {
  const schema = JOI.object({
    billingAddress: JOI.object().required(),
    user: JOI.string().required(),
    totalAmount: JOI.number().required(),
    items: JOI.array().required(),
    paymentMethod: JOI.string().required(),
    paymentRef: JOI.string(),
    deliveryNote: JOI.string(),
  });

  return schema.validate(data);
};

const verificationValidator = (data) => {
  const schema = JOI.object({
    images: JOI.array().required(),
    // partner_params: JOI.object().required(),
  });

  return schema.validate(data);
};

module.exports = {
  regValidator,
  loginValidator,
  productValidator,
  orderValidator,
  regAdminValidator,
  verificationValidator,
};
