const { User } = require("../models/User");

let auth = (req, res, next) => {
  // 클라이언트로부터 쿠키 가져오기
  let token = req.cookies.x_auth;
  // console.log("Received token:", token); // 토큰 로그

  // 토큰 복호화 후 user 찾기
  User.findByToken(token)
    .then((user) => {
      if (!user) {
        throw new Error("유효하지 않은 토큰입니다."); // 사용자 없음
      }
      // console.log("Authenticated user:", user); // 사용자 로그
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

// const { User } = require("../models/User");

// let auth = (req, res, next) => {
//   // 개발 환경에서는 하드코딩된 사용자 정보를 사용
//   if (process.env.NODE_ENV === "development") {
//     // 하드코딩된 테스트용 사용자 ID
//     const userId = "67440c5d55bc0dfc2f5b629d";

//     // 해당 사용자 정보 찾기
//     User.findById(userId)
//       .then((user) => {
//         if (!user) {
//           throw new Error("유효하지 않은 사용자입니다."); // 사용자 없음
//         }
//         req.user = user; // 테스트용 사용자 정보 설정
//         return next();
//       })
//       .catch((err) => {
//         console.error("Authentication error:", err.message);
//         return res.status(401).json({
//           isAuth: false,
//           message: err.message,
//         });
//       });

//     return; // 개발 환경에서는 여기서 종료
//   }

//   // 클라이언트로부터 쿠키 가져오기
//   let token = req.cookies.x_auth;

//   // 토큰 복호화 후 user 찾기
//   User.findByToken(token)
//     .then((user) => {
//       if (!user) {
//         throw new Error("유효하지 않은 토큰입니다."); // 사용자 없음
//       }
//       req.token = token;
//       req.user = user;
//       return next();
//     })
//     .catch((err) => {
//       console.error("Authentication error:", err.message);
//       return res.status(401).json({
//         isAuth: false,
//         message:
//           err.message === "유효하지 않은 토큰입니다."
//             ? "로그인이 필요합니다."
//             : err.message,
//       });
//     });
// };

// module.exports = { auth };
