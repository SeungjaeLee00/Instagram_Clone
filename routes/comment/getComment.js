const express = require("express");
const router = express.Router();
const { Comment } = require("../../models/Comment");
const { Post } = require("../../models/Post");

/**
 * @swagger
 * tags:
 *   - name: "Comments"
 *     description: "댓글 관련 API"
 * /comment/get/{postId}/comments:
 *   get:
 *     description: "게시물에 달린 댓글을 조회하는 API (로그인된 사용자만)"
 *     tags:
 *       - "Comments"
 *     security:
 *       - bearerAuth: []  # JWT 토큰 인증이 필요함
 *     parameters:
 *       - name: "postId"
 *         in: "path"
 *         required: true
 *         description: "댓글을 조회할 게시물의 ID"
 *         schema:
 *           type: string
 *           example: "60b8d6c3f07f6f3b4d455776"
 *     responses:
 *       200:
 *         description: "댓글 조회가 성공적으로 이루어졌습니다."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "댓글 조회가 성공적으로 이루어졌습니다."
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60c72b1f1f1d1f1f1f1f1f1f"
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60b8d6c3f07f6f3b4d455777"
 *                           user_id:
 *                             type: string
 *                             example: "seungjae"
 *                           profile_image:
 *                             type: string
 *                             example: "https://example.com/profile.jpg"
 *                       post:
 *                         type: string
 *                         example: "60b8d6c3f07f6f3b4d455776"
 *                       text:
 *                         type: string
 *                         example: "멋진 게시물입니다!"
 *                       createdAt:
 *                         type: string
 *                         example: "2025-02-04T10:00:00.000Z"
 *                 commentDetail:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60c72b1f1f1d1f1f1f1f1f1f"
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60b8d6c3f07f6f3b4d455777"
 *                           user_id:
 *                             type: string
 *                             example: "seungjae"
 *                           profile_image:
 *                             type: string
 *                             example: "https://example.com/profile.jpg"
 *                       post:
 *                         type: string
 *                         example: "60b8d6c3f07f6f3b4d455776"
 *                       text:
 *                         type: string
 *                         example: "멋진 게시물입니다!"
 *                       createdAt:
 *                         type: string
 *                         example: "2025-02-04T10:00:00.000Z"
 *                       likesCount:
 *                         type: integer
 *                         example: 5
 *       400:
 *         description: "게시물을 찾을 수 없습니다."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "게시물을 찾을 수 없습니다."
 *       401:
 *         description: "인증되지 않은 사용자. 로그인 후 다시 시도하세요."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "로그인 후 다시 시도해주세요."
 *       500:
 *         description: "서버 오류 발생"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "댓글 조회 중 오류가 발생했습니다."
 *                 error:
 *                   type: string
 *                   example: "Error message here"
 */

router.get("/:postId/comments", async (req, res) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });
    }

    // 게시물에 해당하는 댓글들을 조회
    const comments = await Comment.find({ post: postId }).populate(
      "user",
      "user_id username profile_image"
    );
    // .populate("commentLike", "liked likes likeCount");

    const commentsWithLikeCount = comments.map((comment) => ({
      ...comment.toObject(),
      // liked: comment.likes.includes(user_id),
      likesCount: comment.likes.length,
    }));

    return res.status(200).json({
      message: "댓글 조회가 성공적으로 이루어졌습니다.",
      comments: comments,
      commentDetail: commentsWithLikeCount,
    });
  } catch (error) {
    return res.status(500).json({
      message: "댓글 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

module.exports = router;
