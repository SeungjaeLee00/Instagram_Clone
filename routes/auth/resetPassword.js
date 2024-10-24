const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); // bcryptjs 사용
const { User } = require("../../models/User");

// 비밀번호 변경 라우트
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "유효한 사용자가 아닙니다." });
    }

    // 새로운 비밀번호를 bcryptjs로 암호화하여 저장
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("암호화된 새로운 비밀번호:", hashedPassword);

    // 암호화된 비밀번호를 user 객체에 할당
    user.password = hashedPassword;
    user.passwordResetCode = undefined; // 인증코드 제거
    user.passwordResetExpires = undefined; // 인증코드 만료 시간 제거
    await user.save(); // 사용자 정보 저장

    // 저장된 사용자 정보를 불러와서 확인
    const savedUser = await User.findOne({ email });
    // console.log("(resetPW)DB에 저장된 비밀번호:", savedUser.password);

    // 비밀번호가 성공적으로 변경되었음을 응답
    res.status(200).json({
      success: true,
      message: "비밀번호가 성공적으로 변경되었습니다.",
    });
  } catch (error) {
    console.error("비밀번호 변경 중 오류:", error);
    res.status(500).json({
      success: false,
      message: "비밀번호 변경 중 오류가 발생했습니다.",
    });
  }
});

module.exports = router;
