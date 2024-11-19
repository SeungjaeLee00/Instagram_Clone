const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// CORS 설정
// const cors = require("cors");

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

const app = express();
const server = http.createServer(app); // HTTP 서버 생성

// CORS 설정
// app.use(
//   cors({
//     origin: "<http://localhost:3000>",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

// MongoDB 연결
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "instagram_clone",
  })
  .then(() => console.log("MongoDB connected.."))
  .catch((err) => console.log(err));

// 미들웨어
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 라우트 등록
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/post", postRoutes);
app.use("/comment", commentRoutes);
app.use("/search", searchRoutes);
app.use("/dm", chatRoutes);
app.use("/likes", likeRoutes);
app.use("/admin", adminRoutes);

// 서버 초기화
initSocket(server);

// 서버 시작
server.listen(3000, () => {
  console.log(`Server is running on port 3000`);
});

module.exports = app;
