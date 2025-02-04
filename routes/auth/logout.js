const express = require("express");
const router = express.Router();

const { User } = require("../../models/User");
const { auth } = require("../auth");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

/**
 * @swagger
 * tags:
 *   - name: "Auth"
 *     description: "회원가입, 로그인 및 인증 관련 API"
 * /auth/logout/:
 *   get:
 *     description: "사용자 로그아웃"
 *     tags:
 *       - "Auth"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: "로그아웃 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logoutSuccess:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: "잘못된 요청 (Bad Request)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logoutSuccess:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "로그아웃 처리 중 오류가 발생했습니다."
 */

// 로그아웃
router.get("/", auth, (req, res) => {
  // console.log("로그아웃req", req);
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" })
    .then(() => {
      return res.status(200).json({
        logoutSuccess: true,
      });
    })
    .catch((err) => {
      return res.status(400).json({
        logoutSuccess: false,
        message: err.message,
      });
    });
});

module.exports = router;
