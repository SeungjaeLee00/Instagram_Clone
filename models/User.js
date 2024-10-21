const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const Util = require('util')

const userSchema = mongoose.Schema({
  user_id: {
    type: String,
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
    type: String,
    Timestamp: true,
  },
  name: {
    type: String,
    maxlength: 50,
  },
  introduce: {
    type: String,
    maxlength: 100,
  },
  image: String,
  token: {
    type: String,
  },
  role: {
    // user는 관리자 또는 일반인
    type: Number, // 예를 들어, number가 1이면 관리자, 0이면 일반유저
    default: 0,
  },
  tokenExp: {
    // token이 유효하는 기간
    type: String,
  },
  emailVerificationCode: {
    type: String, // 인증 코드를 저장할 필드
  },
  emailVerificationCodeExpires: {
    type: Date, // 인증코드 유효기간
  },
  isEmailVerified: {
    type: Boolean, // 이메일 인증 여부
    default: false, // 기본값: 인증되지 않음
  },
});

userSchema.pre("save", function (next) {
  // userModel에 user정보를 저장하기 전에 처리됨
  var user = this;

  if (user.isModified("password")) {
    // password가 변환될 때만 암호화
    // 비밀번호를 암호화 시키기
    bcrypt.genSalt(saltRounds, function (err, salt) {
      // salt 만들기
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash; // 암호화 키 만드는 데 성공했으면, 원래 비밀번호랑 hash 바꾸고
        next(); // index.js로 돌아가기
      });
    });
  } else {
    // 비밀번호 말고 다른 걸 바꿀 경우
    next(); // next() 없으면 계속 머물게 됨
  }
});

// 비밀번호 비교
userSchema.methods.comparePassword = function(plainPassword){
  const user = this;
  return bcrypt.compare(plainPassword, user.password);
}

// 토큰 생성
userSchema.methods.generateToken = function(){
  var user = this;
  const payload = { _id : user._id.toHexString() };

  console.log(payload);
  // jwt 이용해 webtoken 생성
  // const token = jwt.sign(user._id.toHexString(), 'secretToken');
  const token = jwt.sign(payload, 'secretToken', {expiresIn: "10m"});
  user.token = token;

  return user.save();
}

// 토큰 찾기
userSchema.statics.findByToken = function(token){
  const user = this;
  
  return Util.promisify(jwt.verify)(token, 'secretToken')
  .then((decoded) => {
    return user.findOne({
      "_id": decoded,
      "token": token
    });
  })
  .catch((err) => {
    throw new Error("유효하지 않은 토큰입니다.");
  })
}

const User = mongoose.model("User", userSchema);

module.exports = { User };