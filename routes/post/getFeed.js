const express = require("express");
const router = express.Router();
const { Post } = require("../../models/Post");
const { Follow } = require("../../models/Follow");
const { auth } = require("../../routes/auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

// 팔로우한 사용자의 최근 게시물 조회
router.get("/", auth, async (req, res) => {
  const user_id = req.user._id;

  try {
    // 현재 사용자가 팔로우한 사용자 ID 목록 가져오기
    const following = await Follow.find({ follow_id: user_id }).select(
      "following"
    );

    // 팔로우한 사용자가 있을 때, 그들의 게시물 조회
    const followingIds = following.map((follow) => follow.following);

    // 팔로우한 사용자의 게시물 조회 (게시물이 없을 수도 있음)
    const posts = await Post.find({ follow_id: { $in: followingIds } })
      .sort({ createdAt: -1 }) // 최신순 정렬
      .limit(3) // 최대 3개 게시물
      .populate("user_id", "user_id") // 'user_id' 필드의 'username' 가져오기
      .populate({
        path: "comments",
        populate: { path: "user", select: "username" }, // 댓글 작성자 정보 포함
      });

    // 팔로우한 사용자의 게시물이 없으면 내 게시물을 조회
    if (posts.length === 0) {
      // 내 게시물 조회
      const myPosts = await Post.find({ user_id: user_id }) // 'user' -> 'user_id'로 수정
        .sort({ createdAt: -1 })
        .limit(3)
        .populate("user_id", "user_id")
        .populate({
          path: "comments",
          populate: { path: "user", select: "username" },
        });

      console.log("My Posts:", myPosts); // 디버그: 내 게시물 확인

      // 내 게시물의 좋아요 수 및 댓글의 좋아요 수 포함
      const myPostsWithDetails = myPosts.map((post) => ({
        ...post.toObject(),
        likesCount: post.likes.length, // 게시물 좋아요 수
        comments: post.comments.map((comment) => ({
          ...comment.toObject(),
          likesCount: comment.likes.length, // 댓글 좋아요 수
        })),
      }));

      return res.status(200).json({
        message: "팔로우한 사용자의 게시물이 없으므로 내 게시물을 조회합니다.",
        posts: myPostsWithDetails,
      });
    }

    // 게시물의 좋아요 수 및 댓글의 좋아요 수 포함
    const postsWithDetails = posts.map((post) => ({
      ...post.toObject(),
      likesCount: post.likes.length, // 게시물 좋아요 수
      comments: post.comments.map((comment) => ({
        ...comment.toObject(),
        likesCount: comment.likes.length, // 댓글 좋아요 수
      })),
    }));

    return res.status(200).json({
      message: "팔로우한 사용자의 최근 게시물입니다.",
      posts: postsWithDetails,
    });
  } catch (error) {
    return res.status(500).json({
      message: "피드 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

module.exports = router;
