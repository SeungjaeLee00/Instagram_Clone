const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
require("dotenv").config();

// 토큰 복호화 및 인증 미들웨어
let auth = (req, res, next) => {
  let token = req.cookies.x_auth;

  // 토큰이 없으면 인증 오류 처리
  if (!token) {
    return res.status(401).json({
      isAuth: false,
      message: "로그인이 필요합니다.",
    });
  }
  const secretKey = process.env.JWT_SECRET;

  // JWT_SECRET이 설정되지 않은 경우
  if (!secretKey) {
    return res.status(500).json({
      isAuth: false,
      message: "서버 설정 오류: 비밀 키가 설정되지 않았습니다.",
    });
  }

  // 토큰 복호화 후 user 찾기
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        isAuth: false,
        message: "유효하지 않은 토큰입니다.",
      });
    }

    // 토큰이 유효한 경우, decoded 정보를 통해 사용자 찾기
    User.findById(decoded._id)
      .then((user) => {
        if (!user) {
          return res.status(401).json({
            isAuth: false,
            message: "유효하지 않은 토큰입니다.",
          });
        }

        req.token = token;
        req.user = user;

        // console.log("Authenticated User:", req.user); // 인증된 사용자 정보 확인

        next();
      })
      .catch((err) => {
        console.error("User lookup error:", err);
        return res.status(401).json({
          isAuth: false,
          message: "유효하지 않은 토큰입니다.",
        });
      });
  });
};

module.exports = { auth };
