const express = require("express");
const router = express.Router();
const { Post } = require("../../models/Post");
const { auth } = require("../../routes/auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

router.get("/archivedPost", auth, async (req, res) => {
  const user_id = req.user._id;
  try {
    const myPosts = await Post.find({
      user_id: user_id,
      archived: true,
    })
      .sort({ createdAt: -1 })
      .populate("user_id", "user_id profile_image")
      .populate({
        path: "comments",
        populate: { path: "user", select: "user_id username profile_image" },
      });

    const myPostsWithDetails = myPosts.map((post) => ({
      ...post.toObject(),
      likesCount: post.likes.length, // 게시물 좋아요 수
      comments: post.comments.map((comment) => ({
        ...comment.toObject(),
        likesCount: comment.likes.length, // 댓글 좋아요 수
        liked: comment.likes.includes(user_id), // 댓글 좋아요 여부
      })),
    }));
    return res.status(200).json({
      message: "내 보관된 게시물을 조회합니다.",
      posts: myPostsWithDetails,
    });
  } catch (error) {
    return res.status(500).json({
      message: "피드 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

module.exports = router;
