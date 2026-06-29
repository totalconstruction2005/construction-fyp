const express = require("express");
const router = express.Router();
const contactController = require("./contact.controller");

router.post("/meeting", contactController.submitMeetingRequest);

module.exports = router;
