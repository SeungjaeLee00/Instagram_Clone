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
    const result = await Follow.find({ follow_id: user_id });

    if (!result.length) {
      return res.status(200).json({
        followings: [], // 팔로우하는 사람이 없으면 빈 배열 반환
      });
    }

    const followingList = result.map((follow) => follow.following);
    const followingDetails = await User.find({
      _id: { $in: followingList },
    });

    return res.status(200).json({
      following: followingDetails.map((user) => ({
        user_id: user.user_id,
        username: user.username,
        profile_image: user.profile_image || default_profile,
      })),
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
