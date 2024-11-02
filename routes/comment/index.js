const express = require("express");
const router = express.Router();

const createCommentRoutes = require("./createComment");
const deleteCommentRoutes = require("./deleteComment");

router.use("/create", createCommentRoutes);
// router.use("/delete", deleteCommentRoutes);

module.exports = router;
