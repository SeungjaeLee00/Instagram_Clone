const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// 이메일 전송 함수
const sendVerificationEmail = async (email, verificationCode) => {
  try {
    const info = await transporter.sendMail({
      from: `"SSinstagram" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "SSinstagram 회원가입 이메일 인증 코드",
      text: `인증코드: ${verificationCode}`,
    });
    if (info.accepted.includes(email)) {
      return true;
    } else {
      console.error("메일 전송 실패: 수신자 이메일이 포함되지 않음");
      return false;
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = { sendVerificationEmail };
