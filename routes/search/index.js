const express = require("express");
const router = express.Router();

const searchUser = require("./searchUser");
const searchMultiUsers = require("./searchMultiUsers");

router.use("/single", searchUser);
router.use("/multiple", searchMultiUsers);

module.exports = router;
