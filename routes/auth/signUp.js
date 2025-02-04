const express = require("express");
const router = express.Router();
const { User } = require("../../models/User");
const crypto = require("crypto");
// const bcrypt = require("bcryptjs");
const { sendVerificationEmail } = require("../../utils/sendEmail");

router.use(express.json());

/**
 * @swagger
 * tags:
 *   - name: "Auth"
 *     description: "회원가입, 로그인 및 인증 관련 api"
 * /auth/sign-up/:
 *   post:
 *     description: 회원 가입을 위한 API
 *     tags:
 *       - "Auth"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "사용자의이메일@example.com"
 *                 pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
 *                 description: "이메일 형식은 '@'를 포함해야 합니다."
 *               user_id:
 *                 type: string
 *                 example: "사용자아이디"
 *               password:
 *                 type: string
 *                 example: "비밀번호"
 *     responses:
 *       200:
 *         description: 회원 가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "이메일 전송 성공"
 *       400:
 *         description: 잘못된 요청 (Bad Request)
 *       500:
 *         description: 서버 오류 (Internal Server Error)
 */

// 회원가입 처리 및 이메일 인증 코드 발송
router.post("/", async (req, res) => {
  // const { email } = req.body;
  const { email, user_id } = req.body;

  try {
    console.log("회원가입 시도", req.body);
    // 이메일이 이미 존재하는지 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // 이메일 인증이 이미 완료된 사용자라면 회원가입을 막음
      if (existingUser.isEmailVerified) {
        return res
          .status(400)
          .json({ success: false, message: "이미 사용 중인 이메일입니다." });
      }
      // 이미 존재하는 사용자가 인증코드를 재요청한 경우, 인증코드 재전송 처리
      const emailVerificationCode = crypto.randomBytes(3).toString("hex"); // 6자리 코드 생성
      existingUser.emailVerificationCode = emailVerificationCode;
      existingUser.emailVerificationCodeExpires = Date.now() + 300000; // 인증 코드 유효시간 5분

      // 이메일로 인증번호 재전송
      const emailSent = await sendVerificationEmail(
        email,
        emailVerificationCode
      );
      if (!emailSent) {
        console.error("이메일 전송 실패");
        return res
          .status(500)
          .json({ success: false, message: "이메일 전송 실패" });
      }

      await existingUser.save(); // 변경된 인증코드 저장
      return res
        .status(200)
        .json({ success: true, message: "인증코드가 재전송되었습니다." });
    }

    // 아이디 중복 여부
    const existingUserByUserId = await User.findOne({ user_id });
    if (existingUserByUserId) {
      return res
        .status(400)
        .json({ success: false, message: "이미 사용 중인 아이디입니다." });
    }

    // 새로운 사용자에 대한 인증코드 생성 및 이메일 전송
    const emailVerificationCode = crypto.randomBytes(3).toString("hex"); // 6자리 코드 생성

    const user = new User({
      ...req.body,
      emailVerificationCode, // 생성된 인증코드 저장
      emailVerificationCodeExpires: Date.now() + 300000, // 인증 코드 유효시간 5분
      // role: "user", // 기본적으로 일반 사용자로 설정
    });

    // 이메일로 인증번호 전송
    const emailSent = await sendVerificationEmail(email, emailVerificationCode);
    if (!emailSent) {
      console.error("이메일 전송 실패");
      return res
        .status(500)
        .json({ success: false, message: "이메일 전송 실패" });
    }

    await user.save(); // 사용자 정보 저장
    res.status(200).json({ success: true, message: "이메일 전송 성공" });
  } catch (err) {
    console.error("서버 오류:", err); // 전체적인 오류 로깅
    res.status(500).json({ success: false, err });
  }
});

/**
 * @swagger
 * tags:
 *   - name: "Auth"
 *     description: "회원가입, 로그인 및 인증 관련 API"
 * /auth/sign-up/verify-email/:
 *   post:
 *     description: "이메일 인증을 처리하는 API"
 *     tags:
 *       - "Auth"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "사용자의이메일@example.com"
 *               verificationCode:
 *                 type: string
 *                 example: "인증코드"
 *     responses:
 *       200:
 *         description: "이메일 인증 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "이메일 인증이 완료되었습니다."
 *       400:
 *         description: "잘못된 요청 (사용자 미존재, 인증 코드 불일치, 인증 코드 만료 등)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "인증코드가 일치하지 않습니다."
 *       500:
 *         description: "서버 오류"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 err:
 *                   type: string
 *                   example: "서버 오류 메시지"
 */

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

    // 인증코드 일치 여부 확인
    if (user.emailVerificationCode !== verificationCode) {
      return res
        .status(400)
        .json({ success: false, message: "인증코드가 일치하지 않습니다." });
    }

    // 인증 코드가 만료 여부 확인
    if (user.emailVerificationCodeExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "인증코드가 만료되었습니다." });
    }

    user.isEmailVerified = true; // 이메일 인증 완료
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
