const express = require("express");
const router = express.Router();

const adminSignupRoutes = require("./adminSignup");
const adminUserRoutes = require("./adminDelelteUser");
const adminCommentRoutes = require("./adminDeleteComment");
const adminPostRoutes = require("./admInDeletePost");

router.use("/adminSignup", adminSignupRoutes);
router.use("/adminDelete/users", adminUserRoutes);
router.use("/adminDelete/comments", adminCommentRoutes);
router.use("/adminDelete/posts", adminPostRoutes);

module.exports = router;
