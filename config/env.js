require("dotenv").config({ path: "./.env" });

module.exports = {
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_LIFETIME: process.env.JWT_LIFETIME,
  WEB_APP_URL: process.env.WEB_APP_URL,
  ADMIN_APP_URL: process.env.ADMIN_APP_URL,
  CLOUD_NAME: process.env.CLOUD_NAME,
  CLOUD_API_KEY: process.env.CLOUD_API_KEY,
  CLOUD_API_SECRET: process.env.CLOUD_API_SECRET,
  MAIL_ADDRESS: process.env.MAIL_ADDRESS,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD,
  MAIL_HOST: process.env.MAIL_HOST,
};
