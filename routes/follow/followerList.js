const express = require("express");
const router = express.Router();
const { Follow } = require("../../models/Follow");
const { User } = require("../../models/User");
const { auth } = require("../../routes/auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

router.get("/", auth, async (req, res) => {
  const user_id = req.user._id;

  try {
    const result = await Follow.find({ following: user_id });

    if (!result.length) {
      return res.status(200).json({
        followers: [], // 팔로워가 없으면 빈 배열 반환
      });
    }

    const followerList = result.map((follow) => follow.follow_id);
    const followerDetails = await User.find({ _id: { $in: followerList } });

    return res.status(200).json({
      followers: followerDetails.map((user) => ({
        user_id: user.user_id,
        username: user.username,
        profile_image: user.profile_image || default_profile, // 프로필 이미지 없을 경우 default 설정
      })),
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
