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

    if (!following.length) {
      return res.status(404).json({
        message: "팔로우 중인 사용자가 없습니다. 팔로우를 시작해보세요!",
      });
    }

    // following 배열에서 ID만 추출
    const followingIds = following.map((follow) => follow.following);

    // 팔로우한 사용자의 최근 3개 게시물 가져오기 (생성 날짜 순 정렬)
    const posts = await Post.find({ user: { $in: followingIds } })
      .sort({ createdAt: -1 }) // 최신순 정렬
      .limit(3) // 최대 3개 게시물
      .populate("user", "username") // 작성자 정보 포함
      .populate({
        path: "comments",
        populate: { path: "user", select: "username" }, // 댓글 작성자 정보 포함
      });

    if (!posts.length) {
      return res
        .status(404)
        .json({ message: "팔로우한 사용자의 게시물이 없습니다." });
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
