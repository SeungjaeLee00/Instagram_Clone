// const axios = require("axios");
// require("dotenv").config();

// const KAKAO_TOKEN_VERIFY_URL = "https://kapi.kakao.com/v2/user/me";

// // 카카오 토큰 검증
// const verifyKakaoToken = async (token) => {
//   try {
//     const response = await axios.post(
//       KAKAO_TOKEN_VERIFY_URL,
//       {},
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     if (response.data) {
//       return {
//         isAuth: true,
//         user: {
//           _id: response.data.id,
//           email: response.data.kakao_account.email,
//           username: response.data.properties.nickname,
//         },
//       };
//     } else {
//       return { isAuth: false };
//     }
//   } catch (error) {
//     console.error("카카오 토큰 검증 에러:", error);
//     return { isAuth: false };
//   }
// };

// module.exports = { verifyKakaoToken };
