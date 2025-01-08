const express = require("express");
const router = express.Router();

const searchUser = require("./searchUser");

router.use("/users", searchUser);

module.exports = router;
