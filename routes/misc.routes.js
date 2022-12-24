const express = require("express");
const { contactUs, JoinNewsLetter } = require("../controllers/MiscController");
const router = express.Router();

router.post("/message", contactUs);
router.post("/newsletter", JoinNewsLetter);

module.exports = router;
