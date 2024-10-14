const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");

const config = require("./config/key");
const signUpRoutes = require("./routes/auth/signUp");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

app.use("/auth/sign-up", signUpRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
