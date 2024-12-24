const express = require("express");
const router = express.Router();
const { Follow } = require("../../models/Follow");
const { auth } = require("../../routes/auth");

const cookieParser = require("cookie-parser");
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
      // 팔로우 추가
      const saveFollow = new Follow({
        follow_id: user_id,
        following: following_id,
      });

      const result = await saveFollow.save();

      return res.status(201).json({
        message: "팔로우 성공",
        follow_id: result.follow_id,
        following: result.following,
      });
    }
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
