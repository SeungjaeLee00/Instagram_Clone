const express = require("express");
const router = express.Router();

const editProfileRoutes = require("./EditProfile");
const searchProfileRoutes = require("./SearchProfile");

// 프로필 관련 라우트 설정
router.use("/edit", editProfileRoutes);
router.use("/search", searchProfileRoutes);

module.exports = router;
