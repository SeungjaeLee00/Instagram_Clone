const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  user_id: {
    type: int,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  phone: {
    type: String,
    maxlength: 11,
  },
  gender: {
    type: String,
  },
  birth: {
    type: Timestamp,
  },
  name: {
    type: String,
    maxlength: 50,
  },
  nickname: {
    type: String,
    maxlength: 50,
  },
  introduce: {
    type: String,
    maxlength: 100,
  },
  image: String,
  token: {
    type: Number,
  },
  role: {
    // user가 관리자가 될 수도 있고 일반유저가 될 수도 있기 때문
    type: Number, // 예를 들어, number가 1이면 관리자, 0이면 일반유저
    default: 0,
  },
  tokenExp: {
    // token이 유효하는 기간
    type: Number,
  },
});

const User = mongoose.model("User", userSchema); // 모델이 스키마 감싸주기

module.exports = { User }; // 다른 곳에서도 사용할 수 있게 export
