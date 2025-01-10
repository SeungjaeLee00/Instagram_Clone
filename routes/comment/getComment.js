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
