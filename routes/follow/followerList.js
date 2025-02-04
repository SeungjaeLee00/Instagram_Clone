const express = require("express");
const router = express.Router();
const { Follow } = require("../../models/Follow");
const { User } = require("../../models/User");
const { auth } = require("../../routes/auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

/**
 * @swagger
 * tags:
 *   - name: "Follow"
 *     description: "팔로우 관련 API"
 * /follow/follower:
 *   get:
 *     description: "사용자의 팔로워 목록을 가져오는 API (로그인된 사용자만)"
 * tags:
 *       - "Follow"
 *     security:
 *       - bearerAuth: []  # JWT 토큰 인증이 필요함
 *     responses:
 *       200:
 *         description: "팔로워 목록 조회 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 followers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: string
 *                         example: "seungjae"
 *                       username:
 *                         type: string
 *                         example: "승재"
 *                       profile_image:
 *                         type: string
 *                         example: "https://example.com/profile.jpg"
 *       500:
 *         description: "서버 오류 발생"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "팔로워 목록 조회 실패"
 */

router.get("/", auth, async (req, res) => {
  const user_id = req.user._id;

  try {
    const result = await Follow.find({ following: user_id });

    if (!result.length) {
      return res.status(200).json({
        followers: [], // 팔로워가 없으면 빈 배열 반환
      });
    }

    const followerList = result.map((follow) => follow.follow_id);
    const followerDetails = await User.find({ _id: { $in: followerList } });

    return res.status(200).json({
      followers: followerDetails.map((user) => ({
        user_id: user.user_id,
        username: user.username,
        profile_image: user.profile_image,
      })),
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
