const express = require("express");
const router = express.Router();

const myChatroomList = require("./myChatroomList");
const createChatroom = require("./createChatroom");
const deleteChatroom = require("./deleteChatroom");

router.use("/list", myChatroomList);
router.use("/create", createChatroom);
router.use("/delete", deleteChatroom);

module.exports = router;
