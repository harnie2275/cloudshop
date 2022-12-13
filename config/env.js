require("dotenv").config({ path: "./.env" });

module.exports = {
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_LIFETIME: process.env.JWT_LIFETIME,
  WEB_APP_URL: process.env.WEB_APP_URL,
};