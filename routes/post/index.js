const express = require("express");
const router = express.Router();

const uploadPostRoutes = require("./uploadPost");
const editPostRoutes = require("./editPost");
const deletePostRoutes = require("./deletePost");
const archivePostRoutes = require("./archivePost");
const getPostRoutes = require("./getPost");
const getFeedRoutes = require("./getFeed");
const getMyFeedRoutes = require("./myFeed");
const getArchivedPostRoutes = require("./getArchivedPosts");

/**
 * @swagger
 * tags:
 *   - name: "Post"
 *   - description: "게시물 및 피드 관련 api"
 */

router.use("/upload", uploadPostRoutes);
router.use("/edit", editPostRoutes);
router.use("/delete", deletePostRoutes);
router.use("/archive", archivePostRoutes);

router.use("/get-post", getPostRoutes); // 게시물 단건 조회
router.use("/feed", getFeedRoutes); // 팔로우 피드 전체 조회
router.use("/my", getMyFeedRoutes); // 내 피드 전체 조회
router.use("/my-archived", getArchivedPostRoutes); // 내 보관 피드 전체 조회

module.exports = router;
