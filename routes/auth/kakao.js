const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const router = express.Router();
require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(cookieParser());

const KAKAO_TOKEN_URL = process.env.KAKAO_TOKEN_URL;
const KAKAO_USER_INFO_URL = process.env.KAKAO_USER_INFO_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;

/**
 * @swagger
 * tags:
 *   - name: "Auth"
 *     description: "인증 관련 API"
 * /auth/kakao/callback:
 *   post:
 *     description: "카카오 소셜 로그인 인증 콜백을 처리하는 API"
 *     parameters:
 *       - in: body
 *         name: code
 *         description: "카카오로부터 전달받은 인가 코드"
 *         required: true
 *         schema:
 *           type: string
 *           example: "authorization_code_from_kakao"
 *     responses:
 *       200:
 *         description: "카카오 로그인 성공, JWT 토큰 발급 및 사용자 정보 반환"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Kakao login success"
 *                 loginSuccess:
 *                   type: boolean
 *                   example: true
 *                 jwtToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrYWthb0lkIjo2NDYwYmZjZzY5NTU1M2NmY2FhZWY0ZGVkZGExN2E3ZGFmNTZkZDdmNzUzN2Y2ZjdmZDciLCJlbWFpbCI6InNldW5naW9uQG1haWwuY29tIiwibmlja25hbWUiOiJVa25vd24iLCJpYXQiOjE2NTU4Mzg5NzEsImV4cCI6MTY1NTgzOTU3MX0.1A4h9aRxjfJ2HvXBbcU3tQWiFq9r5rk_AfwZTg6YDEc"
 *                 user:
 *                   type: object
 *                   properties:
 *                     kakaoId:
 *                       type: number
 *                       example: 1234567890
 *                     email:
 *                       type: string
 *                       example: "seungjae@example.com"
 *                     nickname:
 *                       type: string
 *                       example: "이승재"
 *       400:
 *         description: "카카오 인가 코드가 누락된 경우"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Kakao code is missing"
 *       500:
 *         description: "카카오 인증 실패 시 발생하는 서버 오류"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Kakao 인증 실패"
 */

router.post("/callback", async (req, res) => {
  //   console.log("체크");
  const { code } = req.body; // 클라이언트에서 전달받은 인가 코드
  if (!code) {
    return res.status(400).send("Kakao code is missing");
  }
  //   console.log("서버에서 확인하는 code", code);

  try {
    // 카카오 서버로 POST 요청을 보내 액세스 토큰 요청
    const tokenResponse = await axios.post(KAKAO_TOKEN_URL, null, {
      params: {
        grant_type: "authorization_code",
        client_id: KAKAO_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code,
      },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    // console.log("tokenResponse", tokenResponse);

    if (!tokenResponse.data || !tokenResponse.data.access_token) {
      throw new Error("Failed to get access token");
    }
    const { access_token } = tokenResponse.data;

    // 액세스 토큰으로 사용자 정보 요청
    const userResponse = await axios.get(KAKAO_USER_INFO_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const kakaoUser = userResponse.data;
    const email = kakaoUser?.kakao_account?.email || null;
    const nickname = kakaoUser?.properties?.nickname || "Unknown";

    const user = {
      kakaoId: kakaoUser.id,
      email,
      nickname,
    };

    // JWT 토큰 생성
    const jwtToken = jwt.sign(user, JWT_SECRET, { expiresIn: "2h" });
    // console.log("jwtToken", jwtToken);

    // 쿠키 설정
    res.cookie("x_auth", jwtToken, {
      domain: "instagram-clone-ztsr.onrender.com",
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 3600000,
    });

    return res.status(200).json({
      message: "Kakao login success",
      loginSuccess: true,
      jwtToken,
      user: {
        kakaoId: user.kakaoId,
        email: user.email,
        nickname: user.nickname,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Kakao 인증 실패");
  }
});

module.exports = router;
