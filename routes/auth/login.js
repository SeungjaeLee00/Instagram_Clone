const express = require("express");
const app = express.Router();
const { User } = require("../../models/User");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// 사용자 로그인
app.post("/", (req, res) => {
  User.findOne({ email: req.body.email })
    .then(async (user) => {
      if (!user) {
        throw new Error("제공된 이메일에 해당하는 유저가 없습니다.");
      }

      // console.log("(login)DB에 저장된 비밀번호:", user.password); // 저장된 암호화된 비밀번호 로그 출력
      // console.log("입력한 비밀번호:", req.body.password); // 사용자가 입력한 비밀번호 로그 출력

      // 요청된 이메일 DB에 있으면 비밀번호 확인
      const isMatch = await user.comparePassword(req.body.password);
      console.log("비밀번호 비교 결과:", isMatch); // 비교 결과 로그

      if (!isMatch) {
        throw new Error("비밀번호가 틀렸습니다.");
      }

      // 로그인 성공 시 토큰 생성
      return user.generateToken();
    })
    .then((user) => {
      return res.cookie("x_auth", user.token).status(200).json({
        loginSuccess: true,
        userId: user._id, // user.id 대신 user._id로 수정
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

module.exports = app;
