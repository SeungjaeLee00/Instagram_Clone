const express = require("express");
const router = express.Router();

const signUpRoutes = require("./signUp");
const loginRoutes = require("./login");
const logoutRoutes = require("./logout");
const resetPasswordRoute = require("./resetPassword");
const resetPasswordRequestRoute = require("./resetPasswordRequest");
const verifyCodeRoute = require("./verifyCode");
const verifyTokenRoute = require("./verify-token");
const withCredentialsRoute = require("./withdrawMembership");

// 인증 관련 라우트 설정
router.use("/sign-up", signUpRoutes);
router.use("/login", loginRoutes);
router.use("/logout", logoutRoutes);
router.use("/withdraw", withCredentialsRoute);
router.use("/reset-password", resetPasswordRoute);
router.use("/request-reset-password", resetPasswordRequestRoute);
router.use("/verify-reset-code", verifyCodeRoute);
router.use("/verify-token", verifyTokenRoute);

module.exports = router;
