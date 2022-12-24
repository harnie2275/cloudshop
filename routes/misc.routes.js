const express = require("express");
const { contactUs } = require("../controllers/MiscController");
const router = express.Router();

router.post("/message", contactUs);

module.exports = router;
