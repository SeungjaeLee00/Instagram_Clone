const express = require("express");
const router = express.Router();

const uploadPostRoutes = require("./uploadPost");
const editPostRoutes = require("./editPost");
const deletePostRoutes = require("./deletePost");

router.use("/upload", uploadPostRoutes);
router.use("/edit", editPostRoutes);
// router.use("/delete", deletePostRoutes);

module.exports = router;
