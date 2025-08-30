const express = require("express");
const { subscribe, sendNotification } = require("../controllers/notificationController");

const router = express.Router();

router.post("/subscribe", subscribe);
router.post("/send", sendNotification);

module.exports = router;
