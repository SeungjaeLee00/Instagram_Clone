const express = require("express");
const likePostRouter = require("./likePost");
const likeCommment = require("./likeComment");

const router = express.Router();

// 좋아요 관련 API 라우팅
router.use("/posts", likePostRouter);
// router.use('/comments', likeCommment);

module.exports = router;
