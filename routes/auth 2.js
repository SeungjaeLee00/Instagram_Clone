const { User } = require("../models/User");

let auth = (req, res, next) => {
  // 클라이언트로부터 쿠키 가져오기
  let token = req.cookies.x_auth;
  console.log("Received token:", token); // 토큰 로그

  // 토큰 복호화 후 user 찾기
  User.findByToken(token)
    .then((user) => {
      if (!user) {
        throw new Error("유효하지 않은 토큰입니다."); // 사용자 없음
      }
      console.log("Authenticated user:", user); // 사용자 로그
      req.token = token;
      req.user = user;
      return next();
    })
    .catch((err) => {
      console.error("Authentication error:", err.message); // 에러 로그
      return res.status(401).json({
        isAuth: false,
        message:
          err.message === "유효하지 않은 토큰입니다."
            ? "로그인이 필요합니다."
            : err.message,
      });
    });
};

module.exports = { auth };
