const express = require("express");
const router = express.Router();

const likePostRouter = require("./likePost");
const likeCommment = require("./likeComment");

// 좋아요 관련 API 라우팅
router.use("/posts", likePostRouter);
router.use("/comments", likeCommment);

module.exports = router;
