const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");

const config = require("./config/key");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth/index");
const profileRoutes = require("./routes/profile/index");
const postRoutes = require("./routes/post/index");
const commentRoutes = require("./routes/comment/index");
const chatRoutes = require("./routes/chat/index");
const searchRoutes = require("./routes/search/index");
const likeRoutes = require("./routes/like/index");

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
