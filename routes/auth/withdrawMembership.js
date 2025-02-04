const express = require("express");
const router = express.Router();

const { User } = require("../../models/User");
const { Post } = require("../../models/Post");
const { Comment } = require("../../models/Comment");
const { Follow } = require("../../models/Follow");

const { auth } = require("../auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

/**
 * @swagger
 * tags:
 *   - name: "Auth"
 *     description: "회원가입, 로그인 및 인증 관련 API"
 * /auth/withdraw/:
 *   delete:
 *     description: "사용자가 계정을 탈퇴하는 API"
 *      tags:
 *       - "Auth"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "회원탈퇴 성공"
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
 *                   example: "회원탈퇴가 완료되었습니다."
 *       400:
 *         description: "회원탈퇴 중 오류 발생"
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
 *                   example: "회원탈퇴 처리 중 오류가 발생했습니다."
 *       401:
 *         description: "인증되지 않은 사용자"
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
 *                   example: "인증되지 않은 사용자입니다."
 */

// 회원탈퇴
router.delete("/", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    await Post.deleteMany({ user: userId });
    await Comment.deleteMany({ user: userId });
    await Follow.deleteMany({
      $or: [{ follower: userId }, { following: userId }],
    });

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
