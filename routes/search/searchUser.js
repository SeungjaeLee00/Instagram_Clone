const express = require("express");
const router = express.Router();
router.use(express.json());

const { auth } = require("../auth");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

const { User } = require("../../models/User");
const { Post } = require("../../models/Post");
const { Follow } = require("../../models/Follow");

// 닉네임으로 사용자 검색
router.get("/", auth, async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ message: "user_id를 입력해주세요." });
  }

  try {
    const user = await User.findOne({
      user_id: { $regex: user_id, $options: "i" },
    });
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }
    const posts = await Post.find({ user_id: user._id })
      .select("text images createdAt likes")
      .populate("user_id", "user_id profile_image")
      .populate({
        path: "comments",
        populate: { path: "user", select: "user_id username profile_image" },
      });

    const postsDetail = posts.map((post) => ({
      ...post.toObject(),
      likesCount: post.likes.length,
      comments: post.comments.map((comment) => ({
        ...comment.toObject(),
        likesCount: comment.likes.length, // 댓글 좋아요 수
        liked: comment.likes.includes(user_id), // 댓글 좋아요 여부
      })),
    }));

    const following = await Follow.find({ follow_id: user._id }).populate(
      "following",
      "user_id"
    );
    const followers = await Follow.find({ following: user._id }).populate(
      "follow_id",
      "user_id"
    );

    res.status(200).json({
      userName: user.user_id, // 사용자 이름(user_id)
      userId: user._id, // 사용자 ID 추가
      userNickName: user.name, //실제이름..?
      introduce: user.introduce,
      profile_image: user.profile_image,
      posts: postsDetail,
      following: following.map((f) => f.following), // 팔로잉 목록
      followers: followers.map((f) => f.follow_id), // 팔로워 목록
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res
      .status(500)
      .json({ message: "서버 오류가 발생했습니다.", error: error.message });
  }
});

module.exports = router;
