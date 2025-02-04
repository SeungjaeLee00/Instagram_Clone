const express = require("express");
const router = express.Router();

const createCommentRoutes = require("./createComment");
const deleteCommentRoutes = require("./deleteComment");
const getCommentRoustes = require("./getComment");

/**
 * @swagger
 * tags:
 *   - name: "Comment"
 *   - description: "댓글 관련 api"
 */

router.use("/create", createCommentRoutes);
router.use("/delete", deleteCommentRoutes);
router.use("/get", getCommentRoustes);

module.exports = router;
