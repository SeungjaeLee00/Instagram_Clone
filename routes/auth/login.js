const express = require("express");
const router = express.Router();
const { User } = require("../../models/User");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(cookieParser());

// 사용자 로그인
router.post("/", (req, res) => {
  User.findOne({
    $or: [
      { email: req.body.emailOrUsername },
      { user_id: req.body.emailOrUsername },
    ],
  })
    .then(async (user) => {
      // user가 null인지 먼저 확인
      if (!user) {
        // throw new Error(
        //   "제공된 이메일 또는 아이디에 해당하는 유저가 없습니다."
        // );
        alert("제공된 이메일 또는 아이디에 해당하는 유저가 없습니다.");
      }

      if (user.role === "admin") {
        throw new Error("관리자는 일반 사용자로 로그인할 수 없습니다.");
      }

      const isValid = user.isEmailVerified;

      // 유효한 이메일인지 확인
      if (!isValid) {
        throw new Error("이메일이 확인되지 않았습니다.");
      }

      // 비밀번호 확인
      const isMatch = await user.comparePassword(req.body.password);
      return { isMatch, user };
    })
    .then(({ isMatch, user }) => {
      if (!isMatch) {
        throw new Error("비밀번호가 틀렸습니다.");
      }

      // 로그인 성공 시 토큰 생성
      return user.generateToken();
    })

    .then(({ token, user }) => {
      // token과 user를 함께 받아서 처리
      return res
        .cookie("x_auth", token, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
        })
        .status(200)
        .json({
          loginSuccess: true,
          userId: user._id,
          userName: user.user_id,
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({
        loginSuccess: false,
        message: err.message,
      });
    });
});

module.exports = router;
