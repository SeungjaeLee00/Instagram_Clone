const express = require("express");
const router = express.Router();
const { auth } = require("../../routes/auth");
const { Post } = require("../../models/Post");
const { User } = require("../../models/User");
const { Like } = require("../../models/Like");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

// 게시물 단건 조회
router.get("/:id", auth, async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id)
      .populate({
        path: "comments",
        populate: { path: "user", select: "user_id username profile_image" },
      })
      .populate("user_id", "user_id profile_image");

    if (!post) {
      return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });
    }

    const likesCount = post.likes.length; // 좋아요 수

    // // 각 댓글에 대한 좋아요 수 추가
    // const commentsWithLikeCount = post.comments.map((comment) => ({
    //   ...comment.toObject(),
    //   liked: comment.likes.includes(user_id),
    //   likesCount: comment.likes.length,
    // }));

    return res.status(200).json({
      post: {
        ...post.toObject(),
        likesCount,
        // comments: commentsWithLikeCount,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "게시물 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

module.exports = router;
