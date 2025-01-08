const express = require("express");
const router = express.Router();

const { Comment } = require("../../models/Comment");
const { Post } = require("../../models/Post");
const { auth } = require("../auth");
const { User } = require("../../models/User");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

router.delete("/:commentId", auth, async (req, res) => {
  const commentId = req.params.commentId;

  try {
    // 로그인된 사용자 정보를 가져오기
    const user = await User.findById(req.user._id);

    // 유저가 존재하지 않거나 관리자가 아닌 경우 권한 거부
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "댓글을 삭제할 권한이 없습니다." });
    }

    // 댓글을 찾아서 삭제
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
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
