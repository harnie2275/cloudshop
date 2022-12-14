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
app.use(`${API_VERSION}/auth`, authRoutes);
app.use(`${API_VERSION}/user`, userRoutes);
app.use(`${API_VERSION}/product`, productRoutes);

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
