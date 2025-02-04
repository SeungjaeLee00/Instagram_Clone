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
 * /search/single:
 *   get:
 *     description: "사용자 닉네임으로 단일 사용자 검색 및 관련 정보 반환"
 *     parameters:
 *       - in: query
 *         name: user_id
 *         description: "검색할 사용자 닉네임"
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
 *               type: object
 *               properties:
 *                 userName:
 *                   type: string
 *                   example: "seungjae"
 *                 userId:
 *                   type: string
 *                   example: "647bfc9333452b9d90f7d707"
 *                 userNickName:
 *                   type: string
 *                   example: "이승재"
 *                 introduce:
 *                   type: string
 *                   example: "개발자입니다."
 *                 profile_image:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/profile.jpg"
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       text:
 *                         type: string
 *                         example: "오늘은 좋은 날"
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                           format: uri
 *                           example: "https://example.com/image.jpg"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-04T10:00:00Z"
 *                       likesCount:
 *                         type: integer
 *                         example: 10
 *                       comments:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             user_id:
 *                               type: string
 *                               example: "minho"
 *                             username:
 *                               type: string
 *                               example: "민호"
 *                             profile_image:
 *                               type: string
 *                               example: "https://example.com/minho_profile.jpg"
 *                             likesCount:
 *                               type: integer
 *                               example: 5
 *                             liked:
 *                               type: boolean
 *                               example: true
 *                 following:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: string
 *                         example: "jisu"
 *                 followers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: string
 *                         example: "minho"
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

// 닉네임으로 사용자 검색
router.get("/", auth, async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ message: "user_id를 입력해주세요." });
  }

  try {
    const user = await User.findOne({
      user_id: { $regex: user_id, $options: "i" },
    });
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }
    const posts = await Post.find({ user_id: user._id })
      .select("text images createdAt likes")
      .populate("user_id", "user_id profile_image")
      .populate({
        path: "comments",
        populate: { path: "user", select: "user_id username profile_image" },
      });

    const postsDetail = posts.map((post) => ({
      ...post.toObject(),
      likesCount: post.likes.length,
      comments: post.comments.map((comment) => ({
        ...comment.toObject(),
        likesCount: comment.likes.length, // 댓글 좋아요 수
        liked: comment.likes.includes(user_id), // 댓글 좋아요 여부
      })),
    }));

    const following = await Follow.find({ follow_id: user._id }).populate(
      "following",
      "user_id"
    );
    const followers = await Follow.find({ following: user._id }).populate(
      "follow_id",
      "user_id"
    );

    res.status(200).json({
      userName: user.user_id, // 사용자 이름(user_id)
      userId: user._id, // 사용자 ID 추가
      userNickName: user.name, //실제이름..?
      introduce: user.introduce,
      profile_image: user.profile_image,
      posts: postsDetail,
      following: following.map((f) => f.following), // 팔로잉 목록
      followers: followers.map((f) => f.follow_id), // 팔로워 목록
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res
      .status(500)
      .json({ message: "서버 오류가 발생했습니다.", error: error.message });
  }
});

module.exports = router;
