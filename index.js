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


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
