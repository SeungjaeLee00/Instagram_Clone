const express = require("express");
const router = express.Router();

const followPerform = require("./followPerform");
const followList = require("./followList");
const followerList = require("./followerList");

/**
 * @swagger
 * tags:
 *   - name: "Follow"
 *   - description: "팔로우, 팔로잉 관련 api"
 */

router.use("/follow", followPerform);
router.use("/following", followList);
router.use("/follower", followerList);

module.exports = router;
