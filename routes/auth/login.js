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
    User.findOne({email: req.body.email})
    .then(async (user) =>{
      if(!user) {
        throw new Error ("제공된 이메일에 해당하는 유저가 없습니다.");
      }
  
      // 요청된 이메일 DB에 있으면 비밀번호 확인
      const isMatch = await user.comparePassword(req.body.password);
      return {isMatch, user};
    })
    // 비밀번호 확인 결과
    .then(({isMatch, user}) => {
      console.log("비밀번호 일치", isMatch); // 매칭 확인 로그
  
      // 비밀번호가 일치하지 않을 경우
      if(!isMatch){
        throw new Error("비밀번호가 틀렸습니다."); 
      }
      // 로그인 성공
      // 비밀번호 일치할 경우 토큰 생성
      return user.generateToken();
    })
    .then((user) => {
      return res.cookie("x_auth", user.token)
      .status(200) // 200 : 성공적으로 처리
      .json({
        loginSuccess: true,
        userId: user.id,
      });
    })
    //에러
    .catch((err) => {
      console.log(err);
      return res.status(400).json({
        loginSuccess: false,
        message: err.message
      });
    })  
  });

  module.exports = app;