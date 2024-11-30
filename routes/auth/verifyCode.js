const express = require("express");
const router = express.Router();
const { User } = require("../../models/User");

// 인증코드 검증 라우트
router.post("/", async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    const user = await User.findOne({ email });

    if (
      !user ||
      user.passwordResetCode !== verificationCode ||
      Date.now() > user.passwordResetExpires
    ) {
      return res
        .status(400)
        .json({ success: false, message: "인증에 실패하였습니다." });
    }

    // 인증 성공 시
    res.status(200).json({ success: true, message: "인증에 성공하였습니다." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
