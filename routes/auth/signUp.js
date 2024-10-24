const express = require("express");
const router = express.Router();
const { User } = require("../../models/User");
const crypto = require("crypto");
// const bcrypt = require("bcryptjs");
const { sendVerificationEmail } = require("../../utils/sendEmail"); // 이메일 전송 유틸

router.use(express.json());

// 회원가입 처리 및 이메일 인증 코드 발송
router.post("/", async (req, res) => {
  const { email } = req.body;

  try {
    // 이메일이 이미 존재하는지 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "이미 가입된 사용자입니다." });
    }

    // 이메일로 보낼 인증번호 생성
    const emailVerificationCode = crypto.randomBytes(3).toString("hex"); // 6자리 코드 생성

    const user = new User({
      ...req.body,
      emailVerificationCode, // 생성된 인증코드 저장
      emailVerificationCodeExpires: Date.now() + 3600000, // 인증 코드 유효시간 1시간
    });

    // 이메일로 인증번호 전송
    const emailSent = await sendVerificationEmail(email, emailVerificationCode);
    if (!emailSent) {
      return res
        .status(500)
        .json({ success: false, message: "이메일 전송 실패" });
    }

    await user.save(); // 사용자 정보 저장
    res.status(200).json({ success: true, message: "이메일 전송 성공" });
  } catch (err) {
    res.status(500).json({ success: false, err });
  }
});

// 이메일 인증 처리
router.post("/verify-email", async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "사용자를 찾을 수 없습니다." });

    // 이메일이 이미 인증되었는지 확인
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "이미 이메일 인증이 완료되었습니다.",
      });
    }

    if (user.emailVerificationCode !== verificationCode) {
      return res
        .status(400)
        .json({ success: false, message: "인증코드가 일치하지 않습니다." });
    }

    // 인증 코드가 만료되었는지 확인
    if (user.emailVerificationCodeExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "인증코드가 만료되었습니다." });
    }

    user.isEmailVerified = true; // 이메일 인증 완료

    // 이메일 인증 여부만 true로 변경
    user.emailVerificationCode = undefined; // 인증코드 삭제
    user.emailVerificationCodeExpires = undefined; // 인증 코드 만료 시간 삭제

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "이메일 인증이 완료되었습니다." });
  } catch (err) {
    res.status(500).json({ success: false, err });
  }
});

module.exports = router;
