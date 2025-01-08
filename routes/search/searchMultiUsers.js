const express = require("express");
const router = express.Router();
router.use(express.json());

const { auth } = require("../auth");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

const { User } = require("../../models/User");
const { Post } = require("../../models/Post");
const { Follow } = require("../../models/Follow");

router.get("/", auth, async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ message: "user_id를 입력해주세요." });
  }

  try {
    const users = await User.find({
      user_id: { $regex: user_id, $options: "i" },
    }).limit(10);

    if (users.length === 0) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const results = await Promise.all(
      users.map(async (user) => {
        const posts = await Post.find({ user_id: user._id }).select(
          "text images createdAt"
        );
        const following = await Follow.find({ follow_id: user._id }).populate(
          "following",
          "user_id"
        );
        const followers = await Follow.find({ following: user._id }).populate(
          "follow_id",
          "user_id"
        );

        return {
          userName: user.user_id,
          userId: user._id,
          userNickName: user.name,
          introduce: user.introduce,
          profile_image: user.profile_image,
          posts: posts,
          following: following.map((f) => f.following),
          followers: followers.map((f) => f.follow_id),
        };
      })
    );

    res.status(200).json(results);
  } catch (error) {
    console.error("Error occurred:", error);
    res
      .status(500)
      .json({ message: "서버 오류가 발생했습니다.", error: error.message });
  }
});

module.exports = router;
