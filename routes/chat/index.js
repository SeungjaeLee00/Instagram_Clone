const express = require("express");
const router = express.Router();

const chatRouter = require("./chat");
const chatroomRouter = require("./chatroom");

// 개별 파일에서 라우터를 불러와서 설정
router.use("/message", chatRouter);
router.use("/chatroom", chatroomRouter);

module.exports = router;
