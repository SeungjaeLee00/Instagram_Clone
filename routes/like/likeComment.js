const express = require("express");
const router = express.Router();
router.use(express.json());

const { auth } = require("../auth");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

const { Comment } = require("../../models/Comment");
const { emitCommentLike } = require("../../server");

router.post("/:commentId/like", auth, async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    const comment = await Comment.findById(commentId);
    const commenterId = comment.user;
    const postId = comment.post;

    if (!comment) {
      return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    }

    const existingLikeIndex = comment.likes.indexOf(userId);

    if (existingLikeIndex !== -1) {
      // 이미 좋아요가 눌린 경우 좋아요 취소
      comment.likes.splice(existingLikeIndex, 1); // 좋아요 제거
      comment.liked = false;
      await comment.save();

      return res.status(200).json({
        message: "댓글 좋아요가 취소되었습니다.",
        likesCount: comment.likes.length,
        liked: comment.liked,
        likes: comment.likes,
      });
    } else {
      // 좋아요 추가
      comment.likes.push(userId);
      comment.liked = true;
      await comment.save();

      // 좋아요 알림 emit
      emitCommentLike({
        postId: postId,
        commenterId: commenterId,
        commentId: commentId,
        likerId: userId,
        likerName: req.user.user_id,
        likerProfile: req.user.profile_image,
        message: "댓글을 좋아합니다",
      });

      return res.status(201).json({
        message: "댓글 좋아요가 추가되었습니다.",
        likesCount: comment.likes.length,
        liked: comment.liked,
        likes: comment.likes, // 좋아요를 누른 사용자 ID 배열
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
