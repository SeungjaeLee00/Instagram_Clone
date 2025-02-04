const express = require("express");
const router = express.Router();

const { Comment } = require("../../models/Comment"); // 댓글 모델
const { Post } = require("../../models/Post"); // 게시물 모델
const { auth } = require("../auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

/**
 * @swagger
 * tags:
 *   - name: "Comments"
 *     description: "댓글 관련 API"
 * /comment/delete/{commentId}:
 *   delete:
 *     description: "댓글을 삭제하는 API (로그인된 사용자만, 자신이 작성한 댓글만 삭제 가능)"
 *     tags:
 *       - "Comments"
 *     security:
 *       - bearerAuth: []  # JWT 토큰 인증이 필요함
 *     parameters:
 *       - name: "commentId"
 *         in: "path"
 *         required: true
 *         description: "삭제할 댓글의 ID"
 *         schema:
 *           type: string
 *           example: "60c72b1f1f1d1f1f1f1f1f1f"
 *     responses:
 *       200:
 *         description: "댓글이 성공적으로 삭제되었습니다."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "댓글이 성공적으로 삭제되었습니다."
 *       400:
 *         description: "댓글을 찾을 수 없습니다."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "댓글을 찾을 수 없습니다."
 *       403:
 *         description: "삭제 권한이 없는 경우"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "댓글을 삭제할 권한이 없습니다."
 *       500:
 *         description: "서버 오류 발생"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "댓글 삭제 중 오류가 발생했습니다."
 *                 error:
 *                   type: string
 *                   example: "Error message here"
 */

router.delete("/:commentId", auth, async (req, res) => {
  const commentId = req.params.commentId; // 경로 매개변수에서 commentId 가져오기
  const userId = req.user._id; // 로그인된 사용자 ID

  try {
    // 댓글을 찾아서 삭제
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    }

    // 댓글 작성자가 맞는지 확인
    if (comment.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "댓글을 삭제할 권한이 없습니다." });
    }

    // 댓글 삭제
    await Comment.findByIdAndDelete(commentId);

    // 댓글이 달린 게시물에서 댓글 ID 제거
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId },
    });

    return res.status(200).json({
      message: "댓글이 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "댓글 삭제 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

module.exports = router;
