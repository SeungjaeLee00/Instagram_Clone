const express = require("express");
const router = express.Router();
const { User } = require("../../models/User");
const {
  sendPasswordResetEmail,
} = require("../../utils/sendPasswordResetEmail");
const crypto = require("crypto"); // 인증코드 생성에 사용할 모듈

/**
 * @swagger
 * tags:
 *   - name: "Auth"
 *     description: "회원가입, 로그인 및 인증 관련 API"
 * /auth/request-reset-password/:
 *   post:
 *     description: "비밀번호 재설정 요청"
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
 *                 description: "비밀번호 재설정을 원하는 사용자의 이메일 주소"
 *     responses:
 *       200:
 *         description: "인증코드 전송 성공"
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
 *                   example: "인증코드가 이메일로 전송되었습니다."
 *       400:
 *         description: "유효하지 않은 이메일"
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
 *                   example: "유효한 이메일이 아닙니다."
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
 *                 message:
 *                   type: string
 *                   example: "서버 오류가 발생했습니다."
 */

// 비밀번호 재설정 요청 라우트
router.post("/", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "유효한 이메일이 아닙니다." });
    }

    // 인증코드 생성
    const verificationCode = crypto.randomBytes(3).toString("hex");
    user.passwordResetCode = verificationCode;
    user.passwordResetExpires = Date.now() + 300000; // 인증코드 유효 기간 5분 설정
    await user.save();

    // 이메일로 인증코드 전송
    await sendPasswordResetEmail(email, verificationCode);

    res
      .status(200)
      .json({ success: true, message: "인증코드가 이메일로 전송되었습니다." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
