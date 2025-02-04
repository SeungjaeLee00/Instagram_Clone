const express = require("express");
const router = express.Router();

const followPerform = require("./followPerform");
const followList = require("./followList");
const followerList = require("./followerList");

router.use("/follow", followPerform);
router.use("/following", followList);
router.use("/follower", followerList);

module.exports = router;
