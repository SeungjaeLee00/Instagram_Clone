const express = require("express");
const router = express.Router();

const signUpRoutes = require("./signUp");
const loginRoutes = require("./login");
const logoutRoutes = require("./logout");
const resetPasswordRoute = require("./resetPassword");
const resetPasswordRequestRoute = require("./resetPasswordRequest");
const verifyCodeRoute = require("./verifyCode");

// 인증 관련 라우트 설정
router.use("/sign-up", signUpRoutes);
router.use("/login", loginRoutes);
router.use("/logout", logoutRoutes);
router.use("/reset-password", resetPasswordRoute);
router.use("/reset-password-request", resetPasswordRequestRoute);
router.use("/verify-code", verifyCodeRoute);

module.exports = router;
