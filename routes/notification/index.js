const express = require("express");
const router = express.Router();

const deleteNotificationRoutes = require("./deleteNotification");
const getNotificationRoustes = require("./notification");

/**
 * @swagger
 * tags:
 *   - name: "Notification"
 *   - description: "알림 관련 api"
 */

router.use("/delete", deleteNotificationRoutes);
router.use("/", getNotificationRoustes);

module.exports = router;
