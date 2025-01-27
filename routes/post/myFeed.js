const express = require("express");
const router = express.Router();
const { Post } = require("../../models/Post");
const { auth } = require("../../routes/auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

// 내 게시물 전체 보기
router.get("/myFeed", auth, async (req, res) => {
  const user_id = req.user._id;
  try {
    const myPosts = await Post.find({ user_id: user_id, archived: false }) // 'user' -> 'user_id'로 수정
      .sort({ createdAt: -1 })
      .populate("user_id", "user_id profile_image")
      .populate({
        path: "comments",
        populate: { path: "user", select: "user_id username profile_image" },
      });

    // console.log("My Posts:", myPosts); // 디버그: 내 게시물 확인
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
      message: "내 전체 게시물을 조회합니다.",
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
