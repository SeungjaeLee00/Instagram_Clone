const express = require("express");
const router = express.Router();
router.use(express.json());

const { auth } = require("../auth");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

const { Post } = require("../../models/Post");
const { emitPostLike } = require("../../server");

const { User } = require("../../models/User"); // user_id불러 오기 위한 정보

/**
 * @swagger
 * tags:
 *   - name: "Likes"
 *     description: "좋아요 관련 API"
 * /likes/posts/{postId}/like:
 *   post:
 *     description: "게시물에 좋아요를 추가하거나 취소하는 API (로그인된 사용자만)"
 *     tags:
 *       - "Likes"
 *     security:
 *       - bearerAuth: []  # JWT 토큰 인증이 필요함
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: "좋아요를 추가하거나 취소할 게시물의 ID"
 *         schema:
 *           type: string
 *           example: "60e5b0f5b1f16b001c9a8f7a"
 *     responses:
 *       200:
 *         description: "게시물 좋아요 취소 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "좋아요가 취소되었습니다."
 *                 likesCount:
 *                   type: integer
 *                   example: 0
 *                 likes:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "user_id_1"
 *       201:
 *         description: "게시물 좋아요 추가 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "좋아요가 추가되었습니다."
 *                 likesCount:
 *                   type: integer
 *                   example: 1
 *                 likes:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "user_id_1"
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
 *       500:
 *         description: "서버 오류 발생"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "서버 오류가 발생했습니다."
 */

// 게시물 좋아요 API
router.post("/:postId/like", auth, async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const post = await Post.findById(postId);
    const liker = await User.findById(userId).select("user_id");
    const likerName = liker.user_id;
    const PostWriterId = post.user_id;

    if (!post) {
      return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });
    }

    // 이미 좋아요를 누른 게시물인지 확인
    const existingLikeIndex = post.likes.indexOf(userId);

    if (existingLikeIndex !== -1) {
      // 좋아요를 이미 누른 경우, 좋아요 삭제
      post.likes.splice(existingLikeIndex, 1); // likes 배열에서 사용자 ID 제거
      await post.save();
      return res.status(200).json({
        message: "좋아요가 취소되었습니다.",
        likesCount: post.likes.length, // 좋아요 개수 반환
        likes: post.likes, // 최신 좋아요 배열 반환
      });
    } else {
      // 좋아요 추가
      post.likes.push(userId); // likes 배열에 사용자 ID 추가
      await post.save();

      emitPostLike({
        PostWriterId: PostWriterId,
        postId: postId,
        likerId: userId,
        likerName: likerName, // user_id 추가(24.12.20)
        likerProfile: req.user.profile_image,
        message: "게시물을 좋아합니다",
      });

      return res.status(201).json({
        message: "좋아요가 추가되었습니다.",
        likesCount: post.likes.length,
        likes: post.likes, // 최신 좋아요 배열 반환
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
