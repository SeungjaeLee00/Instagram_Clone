const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const Util = require("util");
require("dotenv").config();

const userSchema = mongoose.Schema({
  kakaoId: {
    type: String,
    unique: 1, // 중복 방지
    sparse: true,
  },
  // 닉네임
  user_id: {
    type: String,
    unique: 1,
    required: true, // 필드 반드시 필요
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
    default: "",
  },
  profile_image: { type: String, default: "" },
  token: {
    type: String,
  },
  role: {
    // user는 관리자 또는 일반인
    type: String, // 문자열로 변경
    enum: ["user", "admin"], // 가능한 값 설정
    default: "user", // 기본값: 일반 사용자
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
  // 비밀번호 재설정 관련 필드 추가
  passwordResetCode: {
    type: String,
    default: null,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
  },

  isActive: {
    type: Boolean,
    default: true, // 기본값은 활성화된 상태
  },
});

// 카카오 로그인 시, 해당 ID로 사용자 찾기
userSchema.statics.findOrCreateByKakaoId = async function (kakaoId, userData) {
  const kakaoIdStr = kakaoId.toString();
  console.log("카카오Id 문자열 변환", kakaoIdStr);

  const user = await this.findOne({ kakaoId: kakaoIdStr });
  console.log("모델에서 찾은 user:", user);

  if (user) {
    return user;
  } else {
    console.log("사용자가 존재하지 않음, 새로운 사용자 생성.");
    // 카카오 ID로 사용자 생성
    const newUser = new this({
      kakaoId: kakaoIdStr,
      user_id: userData.user_id || kakaoIdStr,
      email: userData.email,
      name: userData.nickname,
      profile_image: userData.profile_image || null,
    });

    return newUser
      .save()
      .then((savedUser) => {
        console.log("저장된 사용자:", savedUser);
        return savedUser;
      })
      .catch((err) => {
        console.error("사용자 저장 실패:", err);
        throw new Error("사용자 저장 실패");
      });
  }
};

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
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  this.token = token;
  // user를 저장한 후, user와 token을 함께 반환
  return this.save().then(() => ({ token, user: this }));
};

// 토큰 찾기
userSchema.statics.findByToken = async (token) => {
  const user = this;

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET); // async/await으로 변경
    const foundUser = await user.findOne({
      _id: decoded._id,
      token: token,
    });

    if (!foundUser) {
      throw new Error("유효하지 않은 토큰입니다.");
    }

    return foundUser;
  } catch (err) {
    throw new Error("유효하지 않은 토큰입니다.");
  }
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
