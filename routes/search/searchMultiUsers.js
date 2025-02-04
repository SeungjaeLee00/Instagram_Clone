const express = require("express");
const router = express.Router();
router.use(express.json());

const { auth } = require("../auth");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

const { User } = require("../../models/User");
const { Post } = require("../../models/Post");
const { Follow } = require("../../models/Follow");
/**
 * @swagger
 * tags:
 *   - name: "Search"
 *     description: "검색 관련 API"
 * /search/multiple:
 *   get:
 *     description: "사용자 ID로 사용자들을 검색하여 관련 정보 반환"
 *     parameters:
 *       - in: query
 *         name: user_id
 *         description: "검색할 사용자 ID"
 *         required: true
 *         schema:
 *           type: string
 *           example: "seungjae"
 *     security:
 *       - bearerAuth: []  # JWT 토큰 인증이 필요함
 *     responses:
 *       200:
 *         description: "사용자 검색 결과 반환"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userName:
 *                     type: string
 *                     example: "seungjae"
 *                   userId:
 *                     type: string
 *                     example: "647bfc9333452b9d90f7d707"
 *                   userNickName:
 *                     type: string
 *                     example: "이승재"
 *                   introduce:
 *                     type: string
 *                     example: "개발자입니다."
 *                   profile_image:
 *                     type: string
 *                     format: uri
 *                     example: "https://example.com/profile.jpg"
 *                   posts:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         text:
 *                           type: string
 *                           example: "오늘은 좋은 날"
 *                         images:
 *                           type: array
 *                           items:
 *                             type: string
 *                             format: uri
 *                             example: "https://example.com/image.jpg"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-02-04T10:00:00Z"
 *                   following:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: string
 *                           example: "jisu"
 *                   followers:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: string
 *                           example: "minho"
 *       400:
 *         description: "user_id를 입력하지 않았을 때"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "user_id를 입력해주세요."
 *       404:
 *         description: "사용자를 찾을 수 없을 때"
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
 *                 message:
 *                   type: string
 *                   example: "서버 오류가 발생했습니다."
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */

router.get("/", auth, async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ message: "user_id를 입력해주세요." });
  }

  try {
    const users = await User.find({
      user_id: { $regex: user_id, $options: "i" },
    }).limit(10);

    if (users.length === 0) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const results = await Promise.all(
      users.map(async (user) => {
        const posts = await Post.find({ user_id: user._id }).select(
          "text images createdAt"
        );
        const following = await Follow.find({ follow_id: user._id }).populate(
          "following",
          "user_id"
        );
        const followers = await Follow.find({ following: user._id }).populate(
          "follow_id",
          "user_id"
        );

        return {
          userName: user.user_id,
          userId: user._id,
          userNickName: user.name,
          introduce: user.introduce,
          profile_image: user.profile_image,
          posts: posts,
          following: following.map((f) => f.following),
          followers: followers.map((f) => f.follow_id),
        };
      })
    );

    res.status(200).json(results);
  } catch (error) {
    console.error("Error occurred:", error);
    res
      .status(500)
      .json({ message: "서버 오류가 발생했습니다.", error: error.message });
  }
});

module.exports = router;
