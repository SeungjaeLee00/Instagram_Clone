const express = require("express");
const router = express.Router();
const { User } = require("../../models/User");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../../utils/sendEmail");

const ADMIN_INVITE_CODE = process.env.ADMIN_INVITE_CODE; // 환경변수로 불러오기

router.use(express.json());

// 회원가입 처리 및 이메일 인증 코드 발송
router.post("/", async (req, res) => {
  const { email, inviteCode } = req.body;

  try {
    // console.log("Received inviteCode:", inviteCode);
    // 확인용

    // 초대 코드 검증
    if (inviteCode !== ADMIN_INVITE_CODE) {
      return res.status(400).json({
        success: false,
        message: "잘못된 초대 코드입니다. 관리자 초대 코드가 필요합니다.",
      });
    }

    // 초대 코드가 맞으면 관리자 권한 부여
    const role = inviteCode === ADMIN_INVITE_CODE ? "admin" : "user";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return res
          .status(400)
          .json({ success: false, message: "이미 가입된 사용자입니다." });
      }

      const emailVerificationCode = crypto.randomBytes(3).toString("hex");
      existingUser.emailVerificationCode = emailVerificationCode;
      existingUser.emailVerificationCodeExpires = Date.now() + 300000;

      const emailSent = await sendVerificationEmail(
        email,
        emailVerificationCode
      );
      if (!emailSent) {
        return res
          .status(500)
          .json({ success: false, message: "이메일 전송 실패" });
      }

      await existingUser.save();
      return res
        .status(200)
        .json({ success: true, message: "인증코드가 재전송되었습니다." });
    }

    const emailVerificationCode = crypto.randomBytes(3).toString("hex");

    const user = new User({
      ...req.body,
      role, // 설정된 역할 저장
      emailVerificationCode,
      emailVerificationCodeExpires: Date.now() + 300000,
    });

    console.log("Role:", role); // 역할이 제대로 설정됐는지 확인

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

    if (user.emailVerificationCodeExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "인증코드가 만료되었습니다." });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpires = undefined;

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "이메일 인증이 완료되었습니다." });
  } catch (err) {
    res.status(500).json({ success: false, err });
  }
});

module.exports = router;
