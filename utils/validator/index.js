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
    password: JOI.string().required().min(8).max(255),
    phone: JOI.string().required().min(11).max(20),
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

module.exports = { regValidator, loginValidator };
