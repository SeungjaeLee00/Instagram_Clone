const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// CORS 설정
const cors = require("cors");

// Socket.IO 연결, initSocket 함수를 가져옴
const { initSocket } = require("./server");

const config = require("./config/key");
const authRoutes = require("./routes/auth/index");
const profileRoutes = require("./routes/profile/index");
const postRoutes = require("./routes/post/index");
const commentRoutes = require("./routes/comment/index");
const chatRoutes = require("./routes/dm/index");
const searchRoutes = require("./routes/search/index");
const likeRoutes = require("./routes/like/index");
const adminRoutes = require("./routes/admin/index");
const followRoutes = require("./routes/follow/index");
const notificationRoutes = require("./routes/notification/index");
const kakaoRoutes = require("./routes/auth/kakao");

const app = express();
const server = http.createServer(app); // HTTP 서버 생성

// MongoDB 연결
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "instagram_clone",
  })
  .then(() => console.log("MongoDB connected.."))
  .catch((err) => console.log(err));

const baseURL = "https://instagram-clone-client-lr01.onrender.com";
app.use(
  cors({
    origin: baseURL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true, // 인증 정보와 쿠키 포함 허용
  })
);

// 미들웨어
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 라우트 등록
app.use("/auth", authRoutes);
app.use("/auth/kakao", kakaoRoutes);
app.use("/profile", profileRoutes);
app.use("/post", postRoutes);
app.use("/comment", commentRoutes);
app.use("/search", searchRoutes);
app.use("/dm", chatRoutes);
app.use("/likes", likeRoutes);
app.use("/admin", adminRoutes);
app.use("/follow", followRoutes);
app.use("/notifications", notificationRoutes);

// 서버 초기화
initSocket(server);

// 서버 시작
server.listen(5001, () => {
  console.log(`Server is running on port 5001`);
});

module.exports = app;
