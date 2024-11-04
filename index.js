const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");

const config = require("./config/key");
const signUpRoutes = require("./routes/auth/signUp");
const loginRoutes = require("./routes/auth/login");
const logoutRoutes = require("./routes/auth/logout");
const resetPasswordRoute = require("./routes/auth/resetPassword");
const resetPasswordRequestRoute = require("./routes/auth/resetPasswordRequest");
const verifyCodeRoute = require("./routes/auth/verifyCode");

// 마이페이지
const EditProfileRoutes = require("./routes/profile/EditProfile");
// const SearchProfileRoutes = require("./routes/profile/SearchProfile");

//DM
const chatroomRoutes = require("./routes/chat/chatroom");
const MessageRoutes = require("./routes/chat/chat");

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


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth/sign-up", signUpRoutes);
app.use("/auth/login", loginRoutes);
app.use("/auth/logout", logoutRoutes);
app.use("/auth", resetPasswordRoute);
app.use("/auth", resetPasswordRequestRoute);
app.use("/auth", verifyCodeRoute);
app.use("/profile/editProfile", EditProfileRoutes);
// app.use("/profile/searchProfile", SearchProfileRoutes);

app.use("/dm/chatroom", chatroomRoutes);
app.use("/dm/chatroom/message", MessageRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});