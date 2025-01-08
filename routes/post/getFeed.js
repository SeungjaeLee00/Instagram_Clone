const express = require("express");
const router = express.Router();
const { Post } = require("../../models/Post");
const { Follow } = require("../../models/Follow");
const { User } = require("../../models/User");
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
    console.log("Following List:", following);

    const activeUsers = await User.find({
      _id: { $in: followingIds },
      isActive: true,
    }).select("_id");

    console.log("Active users:", activeUsers);
    const activeUserIds = activeUsers.map((user) => user._id);

    // 탈퇴한 사용자의 게시물 제외
    const posts = await Post.find({ user_id: { $in: activeUserIds } })
      .sort({ createdAt: -1 }) // 최신순 정렬
      .limit(3)
      .populate("user_id", "user_id profile_image") // 'user_id' 필드의 'username' 가져오기
      .populate({
        path: "comments",
        populate: { path: "user", select: "user_id username profile_image" },
      });
    console.log("Posts from followed users:", posts);

    // 팔로우한 사용자의 게시물이 없으면 내 게시물을 조회
    if (posts.length === 0) {
      // 내 게시물 조회
      const myPosts = await Post.find({ user_id: user_id }) // 'user' -> 'user_id'로 수정
        .sort({ createdAt: -1 })
        .limit(3)
        .populate("user_id", "user_id profile_image")
        .populate({
          path: "comments",
          populate: { path: "user", select: "user_id username profile_image" },
        });

      console.log("My Posts:", myPosts);

      // 내 게시물의 좋아요 수 및 댓글의 좋아요 수 포함
      const myPostsWithDetails = myPosts.map((post) => ({
        ...post.toObject(),
        likesCount: post.likes.length,
        comments: post.comments.map((comment) => ({
          ...comment.toObject(),
          likesCount: comment.likes.length,
          liked: comment.likes.includes(user_id),
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
      likesCount: post.likes.length,
      comments: post.comments.map((comment) => ({
        ...comment.toObject(),
        liked: comment.likes.includes(user_id),
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
