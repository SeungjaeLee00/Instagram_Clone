const express = require("express");
const router = express.Router();

const uploadPostRoutes = require("./uploadPost");
const editPostRoutes = require("./editPost");
const deletePostRoutes = require("./deletePost");
const getPostRoutes = require("./getPost");

router.use("/upload", uploadPostRoutes);
router.use("/edit", editPostRoutes);
router.use("/delete", deletePostRoutes);
router.use("/get", getPostRoutes);

module.exports = router;
