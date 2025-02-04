const express = require("express");
const router = express.Router();

const likePostRouter = require("./likePost");
const likeCommment = require("./likeComment");

/**
 * @swagger
 * tags:
 *   - name: "Like"
 *   - description: "댓글 좋아요, 게시물 좋아요 관련 api"
 */

// 좋아요 관련 API 라우팅
router.use("/posts", likePostRouter);
router.use("/comments", likeCommment);

module.exports = router;
