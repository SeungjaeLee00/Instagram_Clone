const express = require("express");
const router = express.Router();

const createCommentRoutes = require("./createComment");
const deleteCommentRoutes = require("./deleteComment");
const getCommentRoustes = require("./getComment");

router.use("/create", createCommentRoutes);
router.use("/delete", deleteCommentRoutes);
router.use("/get", getCommentRoustes);

module.exports = router;
