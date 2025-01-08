const express = require("express");
const router = express.Router();

const { Comment } = require("../../models/Comment"); // 댓글 모델
const { Post } = require("../../models/Post"); // 게시물 모델
const { auth } = require("../auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

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
