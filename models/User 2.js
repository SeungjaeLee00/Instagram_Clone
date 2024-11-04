const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const Util = require("util");

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
  // role: {
  //   // user는 관리자 또는 일반인
  //   type: String, // 문자열로 변경
  //   enum: ['user', 'admin'], // 가능한 값 설정
  //   default: 'user', // 기본값: 일반 사용자
  // },
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
  // 비밀번호 재설정 관련 필드 추가
  passwordResetCode: {
    type: String,
    default: null,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
  },
});

userSchema.pre("save", function (next) {
  var user = this;

  // 비밀번호가 변경된 경우 또는 새 사용자일 때만 암호화
  if (user.isModified("password")) {
    // 비밀번호가 이미 bcrypt 해시된 상태인지 확인
    const passwordHashed = user.password.startsWith("$2a$");

    if (!passwordHashed) {
      // 암호화되지 않은 비밀번호만 처리
      bcrypt.genSalt(saltRounds, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function (err, hash) {
          if (err) return next(err);
          user.password = hash;
          next();
        });
      });
    } else {
      next(); // 이미 암호화된 경우, 다시 암호화하지 않음
    }
  } else {
    next(); // 비밀번호가 수정되지 않은 경우 그대로 진행
  }
});

// 비밀번호 비교
userSchema.methods.comparePassword = async function (plainPassword) {
  const user = this;
  // console.log("평문 비밀번호:", plainPassword);
  // console.log("암호화된 비밀번호:", user.password);

  try {
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    console.log("비교 결과:", isMatch);
    return isMatch;
  } catch (err) {
    console.error("비밀번호 비교 중 오류 발생:", err);
    throw err;
  }
};

// 토큰 생성 메서드
userSchema.methods.generateToken = function () {
  const payload = { _id: this._id.toHexString() };
  const token = jwt.sign(payload, "secretToken", { expiresIn: "10m" });
  this.token = token;
  // user를 저장한 후, user와 token을 함께 반환
  return this.save().then(() => ({ token, user: this }));
};

// 토큰 찾기
userSchema.statics.findByToken = function (token) {
  const user = this;

  return Util.promisify(jwt.verify)(token, "secretToken")
    .then((decoded) => {
      return user.findOne({
        _id: decoded,
        token: token,
      });
    })
    .catch((err) => {
      throw new Error("유효하지 않은 토큰입니다.");
    });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
