const nodemailer = require("nodemailer");
require("dotenv").config(); // 환경변수

const transporter = nodemailer.createTransport({
  service: "gmail", // Gmail 사용
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// 이메일 전송 함수
const sendVerificationEmail = async (email, verificationCode) => {
  try {
    await transporter.sendMail({
      from: `"(임시)인스타그램" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "(임시)인스타그램 회원가입 이메일 인증 코드",
      text: `인증코드: ${verificationCode}`,
    });
    return true; // 이메일 전송 성공
  } catch (error) {
    console.error("Error sending email:", error);
    return false; // 이메일 전송 실패
  }
};

module.exports = { sendVerificationEmail };
