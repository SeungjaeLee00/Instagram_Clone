const express = require("express");
const router = express.Router();

const deleteNotificationRoutes = require("./deleteNotification");
const getNotificationRoustes = require("./notification");

router.use("/delete", deleteNotificationRoutes);
router.use("/", getNotificationRoustes);

module.exports = router;
