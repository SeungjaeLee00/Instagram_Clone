const jwt = require("jsonwebtoken");
const axios = require("axios");
const { User } = require("../models/User");
require("dotenv").config();

const KAKAO_TOKEN_VERIFY_URL = "https://kapi.kakao.com/v2/user/me";

// 카카오 토큰 검증 함수
const verifyKakaoToken = async (token) => {
  try {
    const response = await axios.post(
      KAKAO_TOKEN_VERIFY_URL,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("응답값", response);
    if (response.data) {
      return {
        isAuth: true,
        user: {
          _id: response.data.id,
          email: response.data.kakao_account.email,
          username: response.data.properties.nickname,
        },
      };
    } else {
      return { isAuth: false };
    }
  } catch (error) {
    console.error("카카오 토큰 검증 에러:", error);
    return { isAuth: false };
  }
};

// 인증 미들웨어
let auth = async (req, res, next) => {
  // console.log("헤더 확인", req.headers);
  // console.log("쿠키 확인", req.cookies);
  console.log("req 확인", req);

  const jwtToken = req.cookies.x_auth;
  const kakaoToken = req.headers.authorization?.split(" ")[1];
  const secretKey = process.env.JWT_SECRET;

  // JWT 인증 처리
  if (jwtToken) {
    if (!secretKey) {
      return res.status(500).json({
        isAuth: false,
        message: "서버 설정 오류: 비밀 키가 설정되지 않았습니다.",
      });
    }

    try {
      const decoded = jwt.verify(jwtToken, secretKey);
      console.log("decoded", decoded);

      // 토큰 만료 확인
      if (decoded.exp < Date.now() / 1000) {
        return res.status(401).json({
          isAuth: false,
          message: "토큰이 만료되었습니다.",
        });
      }

      let user;
      if (decoded.kakaoId) {
        // 카카오
        const kakaoId = decoded.kakaoId.toString();
        user = await User.findOrCreateByKakaoId(kakaoId, {
          user_id: decoded.user_id,
          email: decoded.email,
          nickname: decoded.nickname,
          profile_image: decoded.profile_image || null,
        });
      } else if (decoded._id) {
        // 일반 유저
        user = await User.findById(decoded._id);
      } else {
        return res.status(401).json({
          isAuth: false,
          message: "유효하지 않은 토큰입니다.",
        });
      }

      console.log("user 확인", user);

      if (!user) {
        return res.status(401).json({
          isAuth: false,
          message: "유효하지 않은 토큰입니다.",
        });
      }

      req.token = jwtToken;
      req.user = user;
      return next();
    } catch (err) {
      console.error("JWT 검증 실패:", err);
      return res.status(401).json({
        isAuth: false,
        message: "유효하지 않은 토큰입니다.",
      });
    }
  }

  // 카카오 로그인 인증 처리
  if (kakaoToken) {
    const kakaoResult = await verifyKakaoToken(kakaoToken);
    if (kakaoResult.isAuth) {
      req.user = kakaoResult.user;
      return next();
    } else {
      return res.status(401).json({
        isAuth: false,
        message: "카카오 인증 실패",
      });
    }
  }

  // JWT와 카카오 토큰 모두 없을 경우
  console.error("쿠키 또는 헤더에서 인증 토큰이 감지되지 않음");
  return res.status(401).json({
    isAuth: false,
    message: "로그인이 필요합니다.",
  });
};

module.exports = { auth };
