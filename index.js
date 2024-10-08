const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const {auth} = require("./routes/auth");

const config = require("./config/key");
const { User } = require("./models/User");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require("mongoose");

// MongoDB 연결 시 dbName 지정
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "instagram_clone", // 데이터베이스 이름 설정
  })
  .then(() => console.log("MongoDB connected.."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("hello world");
});

// 사용자 가입 처리
app.post("/auth/sign-up", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save(); // 사용자 저장
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, err }); // 오류 처리
  }
});

// 사용자 로그인 
app.post("/auth/login", (req, res) => {
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

// 로그아웃
app.get('/auth/logout', auth, (req, res) => {
  User.findOneAndUpdate({_id: req.user._id},
    {token: ""}
  )
  .then(() => {
    return res.status(200).json({
      logoutSuccess: true,
    });
  })
  .catch((err)=>{
    return res.status(400).json({
      logoutSuccess: false,
      message: err.message
    });
  })
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
