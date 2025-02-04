const express = require("express");
const router = express.Router();
const { User } = require("../../models/User");

/**
 * @swagger
 * tags:
 *   - name: "Auth"
 *     description: "회원가입, 로그인 및 인증 관련 API"
 * /auth/verify-reset-code/:
 *   post:
 *     description: "비밀번호 재설정을 위한 인증 코드 검증 API"
 *      tags:
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
 *         description: "인증 코드 검증 성공"
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
 *                   example: "인증에 성공하였습니다."
 *       400:
 *         description: "인증 코드 불일치 또는 만료"
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
 *                   example: "인증에 실패하였습니다."
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
