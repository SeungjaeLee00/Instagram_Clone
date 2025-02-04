const express = require("express");
const router = express.Router();
const { Follow } = require("../../models/Follow");
const { User } = require("../../models/User");
const { auth } = require("../../routes/auth");

const cookieParser = require("cookie-parser");
const { emitFollow } = require("../../server");
router.use(cookieParser());

/**
 * @swagger
 * tags:
 *   - name: "Follow"
 *     description: "팔로우 관련 API"
 * /follow/follow:
 *   post:
 *     description: "사용자를 팔로우하거나 팔로우를 취소하는 API (로그인된 사용자만)"
 * tags:
 *       - "Follow"
 *     security:
 *       - bearerAuth: []  # JWT 토큰 인증이 필요함
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               following_id:
 *                 type: string
 *                 example: "target_user_id"  # 팔로우하거나 팔로우를 취소할 사용자 ID
 *     responses:
 *       200:
 *         description: "팔로우 취소 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "팔로우 취소 성공"
 *       201:
 *         description: "팔로우 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "팔로우 성공"
 *                 follow_id:
 *                   type: string
 *                   example: "user_id"
 *                 follow_name:
 *                   type: string
 *                   example: "승재"
 *                 follow_profile:
 *                   type: string
 *                   example: "https://example.com/profile.jpg"
 *                 following:
 *                   type: string
 *                   example: "target_user_id"
 *                 following_name:
 *                   type: string
 *                   example: "지수영"
 *       404:
 *         description: "사용자를 찾을 수 없음"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "사용자를 찾을 수 없습니다."
 *       500:
 *         description: "서버 오류 발생"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "팔로우 처리 실패"
 */

router.post("/", auth, async (req, res) => {
  const user_id = req.user._id;
  const following_id = req.body.following_id;

  try {
    // 이미 팔로우 중인지 확인
    const checkFollow = await Follow.findOne({
      follow_id: user_id,
      following: following_id,
    });

    if (checkFollow) {
      // 팔로우 취소
      await Follow.deleteOne({ _id: checkFollow._id });
      return res.status(200).json({
        message: "팔로우 취소 성공",
      });
    } else {
      const follow_name = await User.findById(user_id).select(
        "user_id profile_image"
      );
      const following_name = await User.findById(following_id).select(
        "user_id"
      );

      if (!follow_name || !following_name) {
        return res.status(404).json({
          message: "사용자를 찾을 수 없습니다.",
        });
      }

      // console.log("follow_name: ", follow_name.user_id);
      // console.log("following_name: ", following_name.user_id);
      // console.log("follow_name: ", follow_name);

      // 팔로우 추가
      const saveFollow = new Follow({
        follow_id: user_id,
        follow_name: follow_name.user_id,
        follow_profile: follow_name.profile_image,
        following: following_id,
        following_name: following_name.user_id,
      });

      const result = await saveFollow.save();

      emitFollow({
        follow_id: result.follow_id,
        follow_name: result.follow_name,
        follow_profile: result.follow_profile,
        following: result.following,
        following_name: result.following_name,
      });

      return res.status(201).json({
        message: "팔로우 성공",
        follow_id: result.follow_id,
        follow_name: result.follow_name,
        follow_profile: result.follow_profile,
        following: result.following,
        following_name: result.following_name,
      });
    }
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
