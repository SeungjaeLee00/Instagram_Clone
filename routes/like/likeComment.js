const express = require("express");
const router = express.Router();
router.use(express.json());

const { auth } = require("../auth");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

const { Comment } = require("../../models/Comment");
const { emitCommentLike } = require("../../server"); // 알림 emit 함수 가져오기

router.post("/:commentId/like", auth, async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    }

    const existingLikeIndex = comment.likes.indexOf(userId);

    if (existingLikeIndex !== -1) {
      // 이미 좋아요가 눌린 경우 좋아요 취소
      comment.likes.splice(existingLikeIndex, 1);
      await comment.save();
      return res.status(200).json({ message: "댓글 좋아요가 취소되었습니다." });
    } else {
      // 좋아요 추가
      comment.likes.push(userId);
      await comment.save();

      // 좋아요 알림 emit
      emitCommentLike({
        commentId: commentId,
        likerId: userId,
        message: "댓글을 좋아합니다",
      });

      return res.status(201).json({ message: "댓글 좋아요가 추가되었습니다." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
