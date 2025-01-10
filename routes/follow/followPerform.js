const express = require("express");
const router = express.Router();
const { Follow } = require("../../models/Follow");
const { User } = require("../../models/User");
const { auth } = require("../../routes/auth");

const cookieParser = require("cookie-parser");
const { emitFollow } = require("../../server");
router.use(cookieParser());

router.post("/", auth, async (req, res) => {
  const user_id = req.user._id;
  const following_id = req.body.following_id;

  try {
    // 이미 팔로우 중인지 확인
    const checkFollow = await Follow.findOne({
      follow_id: user_id,
      following: following_id,
    });

    if (checkFollow) {
      // 팔로우 취소
      await Follow.deleteOne({ _id: checkFollow._id });
      return res.status(200).json({
        message: "팔로우 취소 성공",
      });
    } else {
      const follow_name = await User.findById(user_id).select("user_id profile_image");
      const following_name = await User.findById(following_id).select("user_id");

      if (!follow_name || !following_name) {
        return res.status(404).json({
          message: "사용자를 찾을 수 없습니다.",
        });
      }

      // console.log("follow_name: ", follow_name.user_id);
      // console.log("following_name: ", following_name.user_id);
      // console.log("follow_name: ", follow_name);

      // 팔로우 추가
      const saveFollow = new Follow({
        follow_id: user_id,
        follow_name: follow_name.user_id,
        follow_profile: follow_name.profile_image,
        following: following_id,
        following_name: following_name.user_id,
      });

      const result = await saveFollow.save();

      emitFollow({
        follow_id: result.follow_id,
        follow_name: result.follow_name,
        follow_profile: result.follow_profile,
        following: result.following,
        following_name: result.following_name,
      });

      return res.status(201).json({
        message: "팔로우 성공",
        follow_id: result.follow_id,
        follow_name: result.follow_name,
        follow_profile: result.follow_profile,
        following: result.following,
        following_name: result.following_name,
      });
    }
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
