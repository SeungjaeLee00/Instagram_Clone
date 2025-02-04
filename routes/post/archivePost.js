const express = require("express");
const router = express.Router();
router.use(express.json());

const { Post } = require("../../models/Post");
const { auth } = require("../auth");
const cookieParser = require("cookie-parser");
router.use(cookieParser());
/**
 * @swagger
 * tags:
 *   - name: "Posts"
 *     description: "게시물 관련 API"
 * /post/archive/{id}/archive:
 *   put:
 *     description: "게시물을 보관 처리하거나 보관을 취소하는 API (로그인된 사용자만)"
 * tags:
 *       - "Posts"
 *     security:
 *       - bearerAuth: []  # JWT 토큰 인증이 필요함
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: "보관 처리할 게시물의 ID"
 *         schema:
 *           type: string
 *           example: "60e5b0f5b1f16b001c9a8f7a"
 *       - name: body
 *         in: body
 *         required: true
 *         description: "보관 처리 여부를 포함한 요청 본문"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: "userId123"
 *                 archive:
 *                   type: boolean
 *                   example: true
 *     responses:
 *       200:
 *         description: "게시물이 보관 처리되거나 보관 취소되었습니다."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "게시물이 보관 완료되었습니다."
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
 *                   example: "게시물 보관 처리 중 오류가 발생했습니다."
 */

router.put("/:id/archive", auth, async (req, res) => {
  const { id } = req.params;
  const { userId, archive } = req.body;
  //   console.log("요청 받은 userId:", userId);
  //   console.log("인증된 사용자 ID:", req.user._id);

  try {
    const post = await Post.findById(id);

    if (!post)
      return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });

    if (post.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    post.archived = archive;
    await post.save();

    const message = archive
      ? "게시물이 보관 완료되었습니다."
      : "게시물이 보관 취소되었습니다.";

    return res.status(200).json({ message });
  } catch (err) {
    console.error("게시물 보관 처리 중 오류 발생:", err);
    return res.status(500).json({
      message: "게시물 보관 처리 중 오류가 발생했습니다.",
      error: err.message,
    });
  }
});

module.exports = router;
