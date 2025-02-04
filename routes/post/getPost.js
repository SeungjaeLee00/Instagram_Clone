const express = require("express");
const router = express.Router();
const { auth } = require("../../routes/auth");
const { Post } = require("../../models/Post");
// const { User } = require("../../models/User");
// const { Like } = require("../../models/Like");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

/**
 * @swagger
 * tags:
 *   - name: "Posts"
 *     description: "게시물 관련 API"
 * /post/get-post/{id}:
 *   get:
 *     description: "게시물 단건을 조회하는 API (로그인된 사용자만)"
 *     tags:
 *       - "Posts"
 *     security:
 *       - bearerAuth: []  # JWT 토큰 인증이 필요함
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "조회할 게시물의 ID"
 *         schema:
 *           type: string
 *           example: "60e5b0f5b1f16b001c9a8f7a"
 *     responses:
 *       200:
 *         description: "게시물 조회 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 post:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60e5b0f5b1f16b001c9a8f7a"
 *                     text:
 *                       type: string
 *                       example: "게시물 내용입니다."
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-04T12:30:00.000Z"
 *                     likesCount:
 *                       type: integer
 *                       example: 10
 *                     liked:
 *                       type: boolean
 *                       example: true
 *                     comments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60e5b0f5b1f16b001c9a8f7b"
 *                           text:
 *                             type: string
 *                             example: "댓글 내용입니다."
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-02-04T12:35:00.000Z"
 *                           likesCount:
 *                             type: integer
 *                             example: 5
 *                           liked:
 *                             type: boolean
 *                             example: false
 *                           user:
 *                             type: object
 *                             properties:
 *                               user_id:
 *                                 type: string
 *                                 example: "seungjae"
 *                               username:
 *                                 type: string
 *                                 example: "seungjae"
 *                               profile_image:
 *                                 type: string
 *                                 example: "https://example.com/profile_image.jpg"
 *       404:
 *         description: "게시물을 찾을 수 없음"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "게시물을 찾을 수 없습니다."
 *       401:
 *         description: "인증되지 않은 사용자"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "인증된 사용자가 아닙니다."
 *       500:
 *         description: "서버 오류 발생"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "게시물 조회 중 오류가 발생했습니다."
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */

// 게시물 단건 조회
router.get("/:id", auth, async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id)
      .populate({
        path: "comments",
        populate: { path: "user", select: "user_id username profile_image" },
      })
      .populate("user_id", "user_id profile_image");

    if (!post) {
      return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });
    }
    const loginUserId = req.user._id;
    const isLiked = post.likes.includes(loginUserId);
    const likesCount = post.likes.length; // 좋아요 수

    return res.status(200).json({
      post: {
        ...post.toObject(),
        likesCount,
        liked: isLiked,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "게시물 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

module.exports = router;
