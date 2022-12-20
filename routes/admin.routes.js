const express = require("express");
const { login } = require("../controllers/Admin/Auth");
const router = express.Router();

router.route("/auth/login").post(login);

module.exports = router;
