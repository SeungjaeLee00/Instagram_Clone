const express = require("express");
const router = express.Router();
const { Post } = require("../../models/Post");
const { auth } = require("../../routes/auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

/**
 * @swagger
 * tags:
 *   - name: "Posts"
 *     description: "게시물 관련 API"
 * /post/my-archived/archivedPost:
 *   get:
 *     description: "사용자가 보관한 게시물을 조회하는 API (로그인된 사용자만)"
 * tags:
 *       - "Posts"
 *     security:
 *       - bearerAuth: []  # JWT 토큰 인증이 필요함
 *     responses:
 *       200:
 *         description: "성공적으로 내 보관된 게시물을 조회"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "내 보관된 게시물을 조회합니다."
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60e5b0f5b1f16b001c9a8f7a"
 *                       text:
 *                         type: string
 *                         example: "게시물 내용입니다."
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-04T12:30:00.000Z"
 *                       archived:
 *                         type: boolean
 *                         example: true
 *                       likesCount:
 *                         type: integer
 *                         example: 10
 *                       comments:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "60e5b0f5b1f16b001c9a8f7b"
 *                             text:
 *                               type: string
 *                               example: "댓글 내용입니다."
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-02-04T12:35:00.000Z"
 *                             likesCount:
 *                               type: integer
 *                               example: 5
 *                             liked:
 *                               type: boolean
 *                               example: false
 *                             user:
 *                               type: object
 *                               properties:
 *                                 user_id:
 *                                   type: string
 *                                   example: "seungjae"
 *                                 username:
 *                                   type: string
 *                                   example: "seungjae"
 *                                 profile_image:
 *                                   type: string
 *                                   example: "https://example.com/profile_image.jpg"
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
 *                   example: "피드 조회 중 오류가 발생했습니다."
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */

router.get("/archivedPost", auth, async (req, res) => {
  const user_id = req.user._id;
  try {
    const myPosts = await Post.find({
      user_id: user_id,
      archived: true,
    })
      .sort({ createdAt: -1 })
      .populate("user_id", "user_id profile_image")
      .populate({
        path: "comments",
        populate: { path: "user", select: "user_id username profile_image" },
      });

    const myPostsWithDetails = myPosts.map((post) => ({
      ...post.toObject(),
      likesCount: post.likes.length, // 게시물 좋아요 수
      comments: post.comments.map((comment) => ({
        ...comment.toObject(),
        likesCount: comment.likes.length, // 댓글 좋아요 수
        liked: comment.likes.includes(user_id), // 댓글 좋아요 여부
      })),
    }));
    return res.status(200).json({
      message: "내 보관된 게시물을 조회합니다.",
      posts: myPostsWithDetails,
    });
  } catch (error) {
    return res.status(500).json({
      message: "피드 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

module.exports = router;
