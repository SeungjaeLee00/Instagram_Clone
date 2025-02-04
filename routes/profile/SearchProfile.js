const express = require("express");
const router = express.Router();
router.use(express.json());

const { User } = require("../../models/User");
const { auth } = require("../auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

/**
 * @swagger
 * tags:
 *   - name: "Users"
 *     description: "사용자 관련 API"
 * /profile/search:
 *   get:
 *     description: "로그인된 사용자의 프로필 정보 조회"
 *     security:
 *       - bearerAuth: []  # JWT 토큰 인증이 필요함
 *     responses:
 *       200:
 *         description: "사용자 프로필 정보 조회 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   example: "chulsoo"
 *                 user_name:
 *                   type: string
 *                   example: "김철수"
 *                 introduce:
 *                   type: string
 *                   example: "안녕하세요, 개발자 김철수입니다."
 *                 profile_image:
 *                   type: string
 *                   format: uri
 *                   example: "https://insta-clone-coding-swim.s3.amazonaws.com/1617895460000_profile.jpg"
 *       401:
 *         description: "인증되지 않은 사용자"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "로그인된 사용자만 프로필 정보를 조회할 수 있습니다."
 *       500:
 *         description: "서버 오류 발생"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "서버 오류"
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */

router.get("/", auth, (req, res) => {
  User.findById(req.user._id)
    .then((result) => {
      return res.status(200).json({
        user_id: result.user_id,
        user_name: result.name,
        introduce: result.introduce,
        profile_image: result.profile_image,
      });
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    });
});

module.exports = router;
