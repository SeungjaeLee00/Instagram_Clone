const express = require("express");
const router = express.Router();

const { User } = require("../../models/User");
const { Post } = require("../../models/Post");
const { Comment } = require("../../models/Comment");
const { auth } = require("../auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

// 회원탈퇴
router.delete("/", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    await Post.deleteMany({ user: userId });
    await Comment.deleteMany({ user: userId });
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "유저를 찾을 수 없습니다.",
      });
    }
    res.clearCookie("auth_token");

    return res.status(200).json({
      success: true,
      message: "회원탈퇴가 완료되었습니다.",
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      success: false,
      message: "회원탈퇴 처리 중 오류가 발생했습니다.",
    });
  }
});

module.exports = router;
