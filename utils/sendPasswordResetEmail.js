const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sendPasswordResetEmail = async (email, verificationCode) => {
  try {
    await transporter.sendMail({
      from: `"(임시)인스타그램" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "비밀번호 재설정 인증 코드",
      text: `비밀번호 재설정을 위한 인증코드: ${verificationCode}`,
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = { sendPasswordResetEmail };
