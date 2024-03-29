require("dotenv").config({ path: "./config/.env" });
require("express-async-errors");
const express = require("express");
const path = require("path");
const app = express();
const API_VERSION = "/api/v1";
const { PORT, MONGO_URI } = require("./config/env");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

/**
 * @description importing extra config
 */
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");
const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
const notFoundMiddleware = require("./middleware/notFound");
const errorHandlerMiddleware = require("./middleware/errorHandler");

/**
 * @description import configs
 */
const connectDB = require("./DB/connect");

/**
 * @returns all applications engine
 */
app.set("trust proxy", 1);
app.use(limiter);
app.use(express.json({ limit: "50mb" }));
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(session({ secret: "SECRET", resave: true, saveUninitialized: true })); // session secret
app.use(flash());

/**
 * @access routes folder
 */
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const adminRoutes = require("./routes/admin.routes");
const miscRoutes = require("./routes/misc.routes");
const vendorRoutes = require("./routes/vendor.routes");
const verificationRoutes = require("./routes/verification.routes");

const { activateAccount } = require("./utils/helper/template/activateAccount");
const mailer = require("./utils/mailer");

/**
 * @return routes
 */
app.get("/", (req, res) =>
  res.send(`
    <h1>Welcome to cloudshopa </h1>
    <div>
        <a href="https://documenter.getpostman.com/view/15530274/2s8YzUy2jz">View Documentation</a>
    </div>
    `)
);
app.get(`${API_VERSION}/`, function (req, res, next) {
  return res.send(`
        <h1>Welcome to cloudshopa </h1>
        <div>
            <a href="https://documenter.getpostman.com/view/15530274/2s8YzUy2jz">View Documentation</a>
        </div>
        
    `);
});
app.get(`${API_VERSION}/template`, function (req, res, next) {
  const template = activateAccount(
    "http://www.w3.org/1999/xhtml",
    req.query?.email
  );
  mailer({
    message: template,
    email: req.query.email,
    subject: "EMAIL ACCOUNT VERIFICATION",
  });
  return res.send(template);
});
app.use(`${API_VERSION}/auth`, authRoutes);
app.use(`${API_VERSION}/user`, userRoutes);
app.use(`${API_VERSION}/product`, productRoutes);
app.use(`${API_VERSION}/order`, orderRoutes);
app.use(`${API_VERSION}/admin`, adminRoutes);
app.use(`${API_VERSION}/misc`, miscRoutes);
app.use(`${API_VERSION}/vendor`, vendorRoutes);
app.use(`${API_VERSION}/verification`, verificationRoutes);

/**
 * @return next error
 */
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

async function start() {
  try {
    await connectDB(MONGO_URI);
    app.listen(PORT, console.log(`listening at port ${PORT}`));
  } catch (error) {
    console.log(error.message);
  }
}

start();
