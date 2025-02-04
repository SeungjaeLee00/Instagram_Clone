const express = require("express");
const router = express.Router();
router.use(express.json());

const { Post } = require("../../models/Post");
const { Comment } = require("../../models/Comment");
const { auth } = require("../auth");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../../config/s3");

/**
 * @swagger
 * tags:
 *   - name: "Posts"
 *     description: "게시물 관련 API"
 * /post/delete/{id}:
 *   delete:
 *     description: "게시물을 삭제하는 API (로그인된 사용자만)"
 * tags:
 *       - "Posts"
 *     security:
 *       - bearerAuth: []  # JWT 토큰 인증이 필요함
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: "삭제할 게시물의 ID"
 *         schema:
 *           type: string
 *           example: "60e5b0f5b1f16b001c9a8f7a"
 *       - name: body
 *         in: body
 *         required: true
 *         description: "삭제를 요청하는 사용자 ID 포함"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: "userId123"
 *     responses:
 *       200:
 *         description: "게시물이 성공적으로 삭제되었습니다."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "게시물이 삭제되었습니다."
 *       400:
 *         description: "잘못된 요청"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "게시물을 찾을 수 없습니다."
 *       403:
 *         description: "권한 없음"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "권한이 없습니다."
 *       500:
 *         description: "서버 오류 발생"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "게시물 삭제 중 오류가 발생했습니다."
 */

// 게시물 삭제
router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body; // 클라이언트에서 받은 userId
  console.log("요청 받은 userId:", userId);
  console.log("인증된 사용자 ID:", req.user._id);

  try {
    const post = await Post.findById(id);

    if (!post)
      return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });

    // console.log("게시물 작성자 userId:", post.user_id.toString()); // 게시물 작성자 ID 확인

    // userId와 post.user_id를 비교
    if (post.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "권한이 없습니다." });
    }
    // S3에서 이미지 삭제
    for (let imageUrl of post.images) {
      const key = imageUrl.split(".com/")[1]; // URL에서 키 추출
      const deleteParams = {
        Bucket: "post-jae",
        Key: key,
      };

      await s3.send(new DeleteObjectCommand(deleteParams)); // S3에서 이미지 삭제
    }

    // 댓글 삭제
    await Comment.deleteMany({ post: id });

    // 게시물 삭제
    await Post.findByIdAndDelete(id);

    return res.status(200).json({ message: "게시물이 삭제되었습니다." });
  } catch (err) {
    console.error("게시물 삭제 중 오류 발생:", err); // 로그 추가
    return res.status(500).json({
      message: "게시물 삭제 중 오류가 발생했습니다.",
      error: err.message,
    });
  }
});

module.exports = router;
