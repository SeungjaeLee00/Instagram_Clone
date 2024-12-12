const express = require("express");
const router = express.Router();
const { Comment } = require("../../models/Comment");
const { Post } = require("../../models/Post");

router.get("/:postId/comments", async (req, res) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });
    }

    // 게시물에 해당하는 댓글들을 조회
    const comments = await Comment.find({ post: postId })
      .populate("user", "user_id username profile_image") // 댓글 작성자의 username을 포함시켜서 조회
      .sort({ createdAt: -1 }); // 최신 댓글부터 정렬

    return res.status(200).json({
      message: "댓글 조회가 성공적으로 이루어졌습니다.",
      comments: comments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "댓글 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

module.exports = router;
