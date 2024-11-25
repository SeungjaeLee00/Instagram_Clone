const express = require("express");
const router = express.Router();

const uploadPostRoutes = require("./uploadPost");
const editPostRoutes = require("./editPost");
const deletePostRoutes = require("./deletePost");
const getPostRoutes = require("./getPost");
const getFeedRoutes = require("./getFeed");

router.use("/upload", uploadPostRoutes);
router.use("/edit", editPostRoutes);
router.use("/delete", deletePostRoutes);
router.use("/get-post", getPostRoutes); // 게시물 단건 조회
router.use("/feed", getFeedRoutes); // 팔로우 피드 조회

module.exports = router;
